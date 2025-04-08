use std::{
    collections::HashMap,
    io::{BufRead, BufReader, Lines},
    process::{id, Child, ChildStdout, Command, Stdio},
};
use tauri::ipc::Channel;

mod utils;
use utils::*;

use models::{
    AncestorInfo, AppMessage, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo,
    GitError, GitHandler, HeadInfo, HistoryItem, Page, RemoteInfo, StagedFileInfo, StashInfo,
    UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo,
};

/// Implementation of [`GitHandler`] that uses the `git` cmd for its operations.
pub struct CmdGit {}

impl CmdGit {
    pub fn new() -> Self {
        CmdGit {}
    }

    fn spawn_command<'a, I>(&self, path: &str, args: I) -> Result<Child, GitError>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let mut cmd = Command::new("git");
        let args_vec: Vec<_> = args.into_iter().collect();

        cmd.current_dir(path)
            .args(&args_vec)
            .stdout(Stdio::piped())
            .spawn()
            .or(Err(GitError::StartCommandFailed {
                args: args_vec.into_iter().map(String::from).collect(),
            }))
    }

    fn spawn_and_notify<'a, I>(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        args: I,
    ) -> Result<Child, GitError>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let process = self.spawn_command(path, args)?;

        let _ = channel.send(AppMessage::ProcessStarted {
            pid: id(),
            subprocess: Some(process.id()),
        });

        Ok(process)
    }

    fn spawn_and_await<'a, I>(&self, path: &str, args: I) -> Result<(), GitError>
    where
        I: IntoIterator<Item = &'a str>,
    {
        let res = self.spawn_command(path, args)?.wait();

        match res.map(|res| res.success()) {
            Ok(true) => Ok(()),
            _ => Err(GitError::GetCommandOutputFailed {}),
        }
    }

    fn get_output_lines_stream<'a>(
        &self,
        process: Child,
    ) -> Result<Lines<BufReader<ChildStdout>>, GitError> {
        let stdout = process.stdout.ok_or(GitError::GetCommandOutputFailed {})?;

        let reader = BufReader::new(stdout);
        Ok(reader.lines())
    }

    fn get_all_output_lines<'a>(&self, process: Child) -> Result<Vec<String>, GitError> {
        let lines = self.get_output_lines_stream(process)?;
        let lines: Result<_, _> = lines.collect();

        lines.or(Err(GitError::GetCommandOutputFailed {}))
    }

    fn get_all_output<'a>(&self, process: Child) -> Result<String, GitError> {
        Ok(self.get_all_output_lines(process)?.join("\n"))
    }

    fn get_files_page<T>(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        include_untracked: bool,
        parse_file_info: fn(&String) -> Option<T>,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<T>, GitError> {
        let mut args = vec![
            "--no-optional-locks",
            "status",
            "--no-branch",
            "--porcelain=2",
            "--no-show-stash",
            "--no-ahead-behind",
        ];

        if include_untracked {
            args.push("--untracked-files=all");
        } else {
            args.push("--untracked-files=no");
        }

        let process = self.spawn_and_notify(channel, path, args)?;
        let lines = self.get_output_lines_stream(process)?;

        let mut items_iter = lines
            .filter_map(|line| line.ok().and_then(|line| parse_file_info(&line)))
            .skip(start_after);
        let items: Vec<_> = items_iter.by_ref().take(limit).collect();
        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
    }
}

impl GitHandler for CmdGit {
    fn init_repository(&self, path: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["init"])
    }

    fn is_repository(&self, path: &str) -> bool {
        self.spawn_and_await(path, ["rev-parse"]).is_ok()
    }

    fn get_branches(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
    ) -> Result<Vec<BranchInfo>, GitError> {
        let process = self.spawn_and_notify(
            channel,
            path,
            ["branch", "--list", "-a", BRANCHES_INFO_FORMAT],
        )?;
        let lines = self.get_output_lines_stream(process)?;
        let branches: Vec<_> = lines
            .filter_map(|line| line.ok().and_then(|line| parse_branch_info(&line)))
            .collect();

        Ok(branches)
    }

    fn checkout_local_branch(&self, path: &str, branch: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["checkout", branch])
            .or(Err(GitError::CheckoutBranchFailed {
                branch: branch.to_string(),
            }))
    }

    fn get_commit_history_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        branch: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<HistoryItem>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = (limit + 1).to_string();
        let branch_arg = branch.to_string() + "~" + &page_arg;

        let process = self.spawn_and_notify(
            channel,
            path,
            [
                "rev-list",
                &branch_arg,
                "-n",
                &page_size_arg,
                "--first-parent",
                "--parents",
            ],
        )?;
        let lines = self.get_output_lines_stream(process)?;
        let mut items_iter = lines
            .take(limit)
            .map(|line| line.ok().and_then(|line| parse_history_item(&line)));

        let items: Option<_> = items_iter.by_ref().collect();
        let items = items.ok_or(GitError::GetReferenceHistoryFailed {
            reference: branch.to_string(),
        })?;

        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
    }

    fn get_commit_info(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        reference: &str,
    ) -> Result<CommitInfo, GitError> {
        let process = self.spawn_and_notify(
            channel,
            path,
            ["show", reference, COMMIT_INFO_FORMAT, "--quiet"],
        )?;
        let lines = self.get_all_output_lines(process)?;

        parse_commit_info(&lines).ok_or(GitError::GetCommitInfoFailed {
            reference: reference.to_string(),
        })
    }

    fn get_head_info(&self, path: &str) -> Result<HeadInfo, GitError> {
        let process = self.spawn_command(
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
        )?;
        let lines = self.get_all_output_lines(process)?;

        parse_head_info(&lines).ok_or(GitError::GetHeadInfoFailed {})
    }

    fn get_staged_files_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<StagedFileInfo>, GitError> {
        self.get_files_page(
            channel,
            path,
            false,
            parse_staged_file_info,
            start_after,
            limit,
        )
        .or(Err(GitError::GetStagedFilesFailed {}))
    }

    fn get_unstaged_files_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UnstagedFileInfo>, GitError> {
        self.get_files_page(
            channel,
            path,
            false,
            parse_unstaged_file_info,
            start_after,
            limit,
        )
        .or(Err(GitError::GetUnstagedFilesFailed {}))
    }

    fn get_unmerged_files_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UnmergedFileInfo>, GitError> {
        self.get_files_page(
            channel,
            path,
            false,
            parse_unmerged_file_info,
            start_after,
            limit,
        )
        .or(Err(GitError::GetUnmergedFilesFailed {}))
    }

    fn get_untracked_files_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<UntrackedFileInfo>, GitError> {
        self.get_files_page(
            channel,
            path,
            true,
            parse_untracked_file_info,
            start_after,
            limit,
        )
        .or(Err(GitError::GetUntrackedFilesFailed {}))
    }

    fn add_to_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["add"], files.clone()].concat();
        self.spawn_and_await(path, args)
            .or(Err(GitError::AddToIndexFailed {}))
    }

    fn remove_from_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["reset", "--"], files.clone()].concat();
        self.spawn_and_await(path, args)
            .or(Err(GitError::RemoveFromIndexFailed {}))
    }

    fn remove_from_tree(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["rm"], files.clone()].concat();
        self.spawn_and_await(path, args)
            .or(Err(GitError::RemoveFromTreeFailed {}))
    }

    fn commit_index(&self, path: &str, message: &str, is_amend: bool) -> Result<(), GitError> {
        let mut args = vec!["commit", "-m", message];

        if is_amend {
            args.push("--amend");
        }

        self.spawn_and_await(path, args)
            .or(Err(GitError::CommitFailed {}))
    }

    fn get_common_ancestor(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError> {
        let _ = channel.send(AppMessage::ProcessStarted {
            pid: id(),
            subprocess: None,
        });

        let parse_ref = |reference: &str, back: u32| -> Option<String> {
            let process = self
                .spawn_command(path, ["rev-parse", &format!("{}^{}", reference, back)])
                .ok()?;
            self.get_all_output(process).ok()
        };

        let mut prev_branch_pointer = None;
        let mut branch_pointer = parse_ref(branch, 0).map(|hash| (hash, 0));
        let mut base_pointer = parse_ref(base_branch, 0).map(|hash| (hash, 0));

        // For each commit in the branch, keep track of the commit that comes immediately next and its depth.
        let mut found_in_branch: HashMap<String, Option<(String, u32)>> = HashMap::new();
        // For each commit in the base branch, keep track of the depth it was found at.
        let mut found_in_base: HashMap<String, u32> = HashMap::new();

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
        channel: &Channel<AppMessage>,
        path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError> {
        let process = self.spawn_and_notify(
            channel,
            path,
            [
                "rev-list",
                "--left-right",
                "--count",
                &format!("{}...{}", branch, base_branch),
            ],
        )?;

        let output = self.get_all_output(process)?;
        parse_branch_divergence(&output).ok_or(GitError::GetBranchDivergenceFailed {
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

        self.spawn_and_await(path, args)
            .or(Err(GitError::PushBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))
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

        self.spawn_and_await(path, args)
            .or(Err(GitError::PullBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))
    }

    fn get_remotes(&self, path: &str) -> Result<Vec<RemoteInfo>, GitError> {
        let process = self.spawn_command(path, ["remote", "--verbose"])?;
        let lines = self.get_all_output_lines(process)?;

        Ok(parse_remote_infos(&lines))
    }

    fn fetch_remote(&self, path: &str, name: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["fetch", name])
            .or(Err(GitError::FetchRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn add_remote(&self, path: &str, name: &str, url: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["remote", "add", name, url])
            .or(Err(GitError::AddRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn remove_remote(&self, path: &str, name: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["remote", "remove", name])
            .or(Err(GitError::RemoveRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn get_stashes(&self, path: &str) -> Result<Vec<StashInfo>, GitError> {
        let process =
            self.spawn_command(path, ["stash", "list", STASH_INFO_FORMAT, "--shortstat"])?;
        let lines = self.get_all_output_lines(process)?;

        Ok(parse_stash_infos(&lines))
    }
}
