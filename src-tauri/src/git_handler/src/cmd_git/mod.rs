use std::{
    collections::HashMap,
    error::Error,
    io::{BufRead, BufReader, Lines},
    os::unix::process,
    process::{ChildStdout, Command, ExitStatus, Stdio},
};

use models::{
    AncestorInfo, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo, GitError,
    GitHandler, HeadInfo, HistoryItem, Page, RemoteInfo, StagedFileInfo, StashInfo,
    UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo,
};
mod utils;
use utils::*;

/// Implementation of [`GitHandler`] that uses the `git` cmd for its operations.
pub struct CmdGit {}

impl CmdGit {
    /// Initialize this implementation without a path.
    pub fn new() -> Self {
        CmdGit {}
    }

    fn create_command<'a, I>(&self, path: &str, args: I) -> Command
    where
        I: IntoIterator<Item = &'a str>,
    {
        let mut cmd = Command::new("git");
        cmd.current_dir(path).args(args);

        cmd
    }

    fn run_command<'a, I>(&self, path: &str, args: I) -> Result<ExitStatus, Box<dyn Error>>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let mut cmd = self.create_command(path, args);
        let status = cmd.status()?;

        Ok(status)
    }

    fn get_all_output<'a, I>(&self, path: &str, args: I) -> Result<String, Box<dyn Error>>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let mut cmd = self.create_command(path, args);
        let output = cmd.output()?.stdout;
        let res = String::from_utf8(output)?.trim().to_string();

        Ok(res)
    }

    fn get_all_output_lines<'a, I>(
        &self,
        path: &str,
        args: I,
    ) -> Result<Vec<String>, Box<dyn Error>>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let output = self.get_all_output(path, args)?;
        let lines = output.lines().map(|line| line.trim().to_string()).collect();

        Ok(lines)
    }

    fn get_output_lines_stream<'a, I>(
        &self,
        path: &str,
        args: I,
    ) -> Result<Lines<BufReader<ChildStdout>>, Box<dyn Error>>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let mut cmd = self.create_command(path, args);
        let child = cmd.stdout(Stdio::piped()).spawn()?;
        let id = child.id();
        let stdout = child.stdout.unwrap();

        let reader = BufReader::new(stdout);
        Ok(reader.lines())
    }

    fn get_files_page<T>(
        &self,
        path: &str,
        include_untracked: bool,
        parse_file_info: fn(&String) -> Option<T>,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<T>, Box<dyn Error>> {
        let mut args = vec![
            "--no-optional-locks",
            "status",
            "--no-branch",
            "--porcelain=2",
            "--no-show-stash",
            "--no-ahead-behind",
        ];

        if (include_untracked) {
            args.push("--untracked-files=all");
        } else {
            args.push("--untracked-files=no");
        }

        let lines = self.get_output_lines_stream(path, args);

        let mut items_iter = lines?
            .filter_map(|line| line.ok().and_then(|line| parse_file_info(&line)))
            .skip(start_after);
        let items: Vec<_> = items_iter.by_ref().take(limit).collect();
        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
    }
}

impl GitHandler for CmdGit {
    fn init_repository(&self, path: &str) -> Result<(), GitError> {
        self.run_command(path, ["init"])
            .or(Err(GitError::AlreadyARepository {}))?;

        Ok(())
    }

    fn is_repository(&self, path: &str) -> bool {
        self.run_command(&path, ["rev-parse"]).is_ok()
    }

    fn get_branches(&self, path: &str) -> Result<Vec<BranchInfo>, GitError> {
        self.get_all_output_lines(path, ["branch", "--list", "-a", BRANCHES_INFO_FORMAT])
            .or(Err(GitError::GetBranchesFailed {}))
            .map(|lines| {
                lines
                    .iter()
                    .map(parse_branch_info)
                    .filter_map(|x| x)
                    .collect()
            })
    }

    fn checkout_local_branch(&self, path: &str, branch: &str) -> Result<(), GitError> {
        self.run_command(path, ["checkout", branch])
            .or(Err(GitError::CheckoutBranchFailed {
                branch: branch.to_string(),
            }))?;

        Ok(())
    }

    fn get_commit_history_page(
        &self,
        path: &str,
        branch: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<HistoryItem>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = (limit + 1).to_string();
        let branch_arg = branch.to_string() + "~" + &page_arg;

        let lines = self
            .get_all_output_lines(
                path,
                [
                    "rev-list",
                    &branch_arg,
                    "-n",
                    &page_size_arg,
                    "--first-parent",
                    "--parents",
                ],
            )
            .or(Err(GitError::GetReferenceHistoryFailed {
                reference: branch.to_string(),
            }))?;

        let items: Option<Vec<HistoryItem>> =
            lines.iter().take(limit).map(parse_history_item).collect();

        let items = items.ok_or(GitError::GetReferenceHistoryFailed {
            reference: branch.to_string(),
        })?;

        let has_next = lines.len() > limit;

        Ok(Page { items, has_next })
    }

    fn get_commit_info(&self, path: &str, reference: &str) -> Result<CommitInfo, GitError> {
        self.get_all_output_lines(path, ["show", reference, COMMIT_INFO_FORMAT, "--quiet"])
            .ok()
            .and_then(|lines| parse_commit_info(&lines))
            .ok_or(GitError::GetCommitInfoFailed {
                reference: reference.to_string(),
            })
    }

    fn get_head_info(&self, path: &str) -> Result<HeadInfo, GitError> {
        self.get_all_output_lines(
            &path,
            [
                "--no-optional-locks",
                "status",
                "--branch",
                "--porcelain=2",
                "--no-show-stash",
                "--no-ahead-behind",
                ".git",
            ],
        )
        .ok()
        .and_then(|lines| parse_head_info(&lines))
        .ok_or(GitError::GetHeadInfoFailed {})
    }

    fn get_staged_files_page(
        &self,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<StagedFileInfo>, GitError> {
        self.get_files_page(path, false, parse_staged_file_info, start_after, limit)
            .or(Err(GitError::GetStagedFilesFailed {}))
    }

    fn get_unstaged_files_page(
        &self,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UnstagedFileInfo>, GitError> {
        self.get_files_page(path, false, parse_unstaged_file_info, start_after, limit)
            .or(Err(GitError::GetUnstagedFilesFailed {}))
    }

    fn get_unmerged_files_page(
        &self,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UnmergedFileInfo>, GitError> {
        self.get_files_page(path, false, parse_unmerged_file_info, start_after, limit)
            .or(Err(GitError::GetUnmergedFilesFailed {}))
    }

    fn get_untracked_files_page(
        &self,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UntrackedFileInfo>, GitError> {
        self.get_files_page(path, true, parse_untracked_file_info, start_after, limit)
            .or(Err(GitError::GetUntrackedFilesFailed {}))
    }

    fn add_to_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["add"], files.clone()].concat();
        self.run_command(path, args)
            .or(Err(GitError::AddToIndexFailed {}))?;

        Ok(())
    }

    fn remove_from_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["reset", "--"], files.clone()].concat();
        self.run_command(path, args)
            .or(Err(GitError::RemoveFromIndexFailed {}))?;

        Ok(())
    }

    fn remove_from_tree(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["rm"], files.clone()].concat();
        self.run_command(path, args)
            .or(Err(GitError::RemoveFromTreeFailed {}))?;

        Ok(())
    }

    fn commit_index(&self, path: &str, message: &str, is_amend: bool) -> Result<(), GitError> {
        let mut args = vec!["commit", "-m", message];

        if is_amend {
            args.push("--amend");
        }

        self.run_command(path, args)
            .or(Err(GitError::CommitFailed {}))?;

        Ok(())
    }

    fn get_common_ancestor(
        &self,
        path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError> {
        let parse_ref = |reference: &str, back: u64| -> Option<String> {
            self.get_all_output(path, ["rev-parse", &format!("{}^{}", reference, back)])
                .ok()
        };

        let mut prev_branch_pointer = None;
        let mut branch_pointer = parse_ref(branch, 0).map(|hash| (hash, 0));
        let mut base_pointer = parse_ref(base_branch, 0).map(|hash| (hash, 0));

        // For each commit in the branch, keep track of the commit that comes immediately next and its depth.
        let mut found_in_branch: HashMap<String, Option<(String, u64)>> = HashMap::new();
        // For each commit in the base branch, keep track of the depth it was found at.
        let mut found_in_base: HashMap<String, u64> = HashMap::new();

        loop {
            if let Some((branch_hash, branch_distance)) = branch_pointer {
                if let Some(base_distance) = found_in_base.get(&branch_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_branch_pointer.map(
                            |(prev_branch_hash, prev_branch_distance)| AncestorInfo {
                                hash: prev_branch_hash,
                                distance: prev_branch_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: branch_hash,
                            distance: *base_distance,
                        },
                    }));
                }

                found_in_branch.insert(branch_hash.to_owned(), prev_branch_pointer);
                prev_branch_pointer = Some((branch_hash.to_string(), branch_distance));
                branch_pointer = parse_ref(&branch_hash, 1).map(|hash| (hash, branch_distance + 1))
            }

            if let Some((base_hash, base_distance)) = base_pointer {
                if let Some(prev_branch_pointer) = found_in_branch.get(&base_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_branch_pointer.as_ref().map(
                            |(prev_branch_hash, prev_branch_distance)| AncestorInfo {
                                hash: prev_branch_hash.to_string(),
                                distance: *prev_branch_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: base_hash,
                            distance: base_distance,
                        },
                    }));
                }

                found_in_base.insert(base_hash.to_owned(), base_distance);
                base_pointer = parse_ref(&base_hash, 1).map(|hash| (hash, base_distance + 1))
            }

            if branch_pointer.is_none() && base_pointer.is_none() {
                return Ok(None);
            }
        }
    }

    fn get_branch_divergence(
        &self,
        path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError> {
        self.get_all_output(
            path,
            [
                "rev-list",
                "--left-right",
                "--count",
                &format!("{}...{}", branch, base_branch),
            ],
        )
        .ok()
        .and_then(|line| parse_branch_divergence(&line))
        .ok_or(GitError::GetBranchDivergenceFailed {
            branch: branch.to_string(),
            base_branch: base_branch.to_string(),
        })
    }

    fn push_branch(
        &self,
        path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_force: bool,
        set_upstream: bool,
    ) -> Result<(), GitError> {
        let remote_ref = format!("{}:{}", branch, remote_branch);
        let mut args = vec!["push", remote, &remote_ref];

        if is_force {
            args.push("--force");
        }

        if set_upstream {
            args.push("--set-upstream");
        }

        self.run_command(path, args)
            .or(Err(GitError::PushBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))?;

        Ok(())
    }

    fn pull_branch(
        &self,
        path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_rebase: bool,
    ) -> Result<(), GitError> {
        let remote_ref = format!("{}:{}", branch, remote_branch);
        let mut args = vec!["pull", remote, &remote_ref];

        if is_rebase {
            args.push("--rebase");
        }

        self.run_command(path, args)
            .or(Err(GitError::PullBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))?;

        Ok(())
    }

    fn get_remotes(&self, path: &str) -> Result<Vec<RemoteInfo>, GitError> {
        self.get_all_output_lines(path, ["remote", "--verbose"])
            .ok()
            .and_then(|lines| Some(parse_remote_infos(&lines)))
            .ok_or(GitError::GetRemotesFailed {})
    }

    fn fetch_remote(&self, path: &str, name: &str) -> Result<(), GitError> {
        self.run_command(path, ["fetch", name])
            .or(Err(GitError::FetchRemoteFailed {
                name: name.to_string(),
            }))?;

        Ok(())
    }

    fn add_remote(&self, path: &str, name: &str, url: &str) -> Result<(), GitError> {
        self.run_command(path, ["remote", "add", name, url])
            .or(Err(GitError::AddRemoteFailed {
                name: name.to_string(),
            }))?;

        Ok(())
    }

    fn remove_remote(&self, path: &str, name: &str) -> Result<(), GitError> {
        self.run_command(path, ["remote", "remove", name]).or(Err(
            GitError::RemoveRemoteFailed {
                name: name.to_string(),
            },
        ))?;

        Ok(())
    }

    fn get_stashes(&self, path: &str) -> Result<Vec<StashInfo>, GitError> {
        self.get_all_output_lines(path, ["stash", "list", STASH_INFO_FORMAT, "--shortstat"])
            .ok()
            .and_then(|lines| Some(parse_stash_infos(&lines)))
            .ok_or(GitError::GetStashesFailed {})
    }
}
