use std::{
    collections::HashMap,
    io::{BufRead, BufReader, Lines},
    process::{Child, ChildStdout, Command, Stdio},
};
use tauri::ipc::Channel;

mod utils;
use utils::*;

use models::{
    AncestorInfo, AppMessage, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo,
    FileInfo, FileTypesFilter, GitError, GitHandler, HeadInfo, HistoryItem, Page, RemoteInfo,
    StashInfo,
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
        let _ = channel.send(AppMessage::ProcessStarted { pid: process.id() });

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

    fn checkout(&self, path: &str, reference: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["checkout", reference])
            .or(Err(GitError::CheckoutFailed {
                reference: reference.to_string(),
            }))
    }

    fn get_commit_history_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        reference: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<HistoryItem>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = (limit + 1).to_string();
        let reference_arg = reference.to_string() + "~" + &page_arg;

        let process = self.spawn_and_notify(
            channel,
            path,
            [
                "rev-list",
                &reference_arg,
                "-n",
                &page_size_arg,
                "--first-parent",
                "--parents",
            ],
        )?;
        let mut lines = self.get_output_lines_stream(process)?;

        let items = lines
            .by_ref()
            .take(limit)
            .map(|line| line.ok().and_then(|line| parse_history_item(&line)))
            .collect::<Option<_>>()
            .ok_or(GitError::GetReferenceHistoryFailed {
                reference: reference.to_string(),
            })?;
        let has_next = lines.next().is_some();

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

    fn get_files_page(
        &self,
        channel: &Channel<AppMessage>,
        path: &str,
        filter: &FileTypesFilter,
        pathspec: Option<&str>,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<FileInfo>, GitError> {
        let mut args = vec![
            "--no-optional-locks",
            "status",
            "--no-branch",
            "--porcelain=2",
            "--no-show-stash",
            "--no-ahead-behind",
        ];

        if filter.untracked.unwrap_or(false) {
            args.push("--untracked-files=all");
        } else {
            args.push("--untracked-files=no");
        }

        if let Some(pathspec) = pathspec {
            args.push("--");
            args.push(pathspec);
        }

        let parse_line = |line: String| -> Option<FileInfo> {
            if filter.staged.unwrap_or(false) {
                if let Some(info) = parse_staged_file_info(&line) {
                    return Some(FileInfo::Staged(info));
                }
            }
            if filter.unstaged.unwrap_or(false) {
                if let Some(info) = parse_unstaged_file_info(&line) {
                    return Some(FileInfo::Unstaged(info));
                }
            }
            if filter.unmerged.unwrap_or(false) {
                if let Some(info) = parse_unmerged_file_info(&line) {
                    return Some(FileInfo::Unmerged(info));
                }
            }
            if filter.untracked.unwrap_or(false) {
                if let Some(info) = parse_untracked_file_info(&line) {
                    return Some(FileInfo::Untracked(info));
                }
            }

            None
        };

        let process = self.spawn_and_notify(channel, path, args)?;
        let lines = self.get_output_lines_stream(process)?;

        let mut items_iter = lines
            .filter_map(|line| line.ok().and_then(parse_line))
            .skip(start_after);
        let items: Vec<_> = items_iter.by_ref().take(limit).collect();
        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
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

    // TODO: optimize this. It can be very slow in some cases.
    fn get_common_ancestor(
        &self,
        _: &Channel<AppMessage>,
        path: &str,
        reference_a: &str,
        reference_b: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError> {
        // TODO: handle cancelation

        let parse_ref = |reference: &str, back: u32| -> Option<String> {
            let process = self
                .spawn_command(path, ["rev-parse", &format!("{}^{}", reference, back)])
                .ok()?;
            self.get_all_output(process).ok()
        };

        let mut prev_ref_a_pointer = None;
        let mut ref_a_pointer = parse_ref(reference_a, 0).map(|hash| (hash, 0));
        let mut ref_b_pointer = parse_ref(reference_b, 0).map(|hash| (hash, 0));

        // For each ancestor of reference_a, keep track of the commit that comes immediately next and its depth.
        let mut found_in_ref_a: HashMap<String, Option<(String, u32)>> = HashMap::new();
        // For each ancestor of reference_b, keep track of the depth it was found at.
        let mut found_in_ref_b: HashMap<String, u32> = HashMap::new();

        loop {
            if let Some((ref_a_hash, ref_a_distance)) = ref_a_pointer {
                if let Some(ref_b_distance) = found_in_ref_b.get(&ref_a_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_ref_a_pointer.map(
                            |(prev_ref_a_hash, prev_ref_a_distance)| AncestorInfo {
                                hash: prev_ref_a_hash,
                                distance: prev_ref_a_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: ref_a_hash,
                            distance: *ref_b_distance,
                        },
                    }));
                }

                found_in_ref_a.insert(ref_a_hash.to_owned(), prev_ref_a_pointer);
                prev_ref_a_pointer = Some((ref_a_hash.to_string(), ref_a_distance));
                ref_a_pointer = parse_ref(&ref_a_hash, 1).map(|hash| (hash, ref_a_distance + 1))
            }

            if let Some((ref_b_hash, ref_b_distance)) = ref_b_pointer {
                if let Some(prev_ref_a_pointer) = found_in_ref_a.get(&ref_b_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_ref_a_pointer.as_ref().map(
                            |(prev_ref_a_hash, prev_ref_a_distance)| AncestorInfo {
                                hash: prev_ref_a_hash.to_string(),
                                distance: *prev_ref_a_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: ref_b_hash,
                            distance: ref_b_distance,
                        },
                    }));
                }

                found_in_ref_b.insert(ref_b_hash.to_owned(), ref_b_distance);
                ref_b_pointer = parse_ref(&ref_b_hash, 1).map(|hash| (hash, ref_b_distance + 1))
            }

            if ref_a_pointer.is_none() && ref_b_pointer.is_none() {
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
        let mut lines = self.get_output_lines_stream(process)?.peekable();
        let mut stashes = Vec::new();

        lines.next(); // Skip the first line
        while lines.peek().is_some() {
            let mut stash_lines = lines
                .by_ref()
                .take(4)
                .collect::<Result<Vec<String>, _>>()
                .or(Err(GitError::GetCommandOutputFailed {}))?;

            let diff_line = lines
                .next()
                .transpose()
                .or(Err(GitError::GetCommandOutputFailed {}))?;

            if let Some(diff_line) = diff_line {
                if !diff_line.is_empty() {
                    stash_lines.push(diff_line);
                    lines.next();
                    lines.next();
                }
            }

            let stash_info = parse_stash_info(&stash_lines).ok_or(GitError::GetStashesFailed {})?;
            stashes.push(stash_info);
        }

        Ok(stashes)
    }

    fn stash(
        &self,
        path: &str,
        message: Option<&str>,
        files: &Vec<&str>,
        include_untracked: bool,
    ) -> Result<(), GitError> {
        let mut args = vec!["stash", "push"];

        if include_untracked {
            args.push("-u");
        }

        if let Some(message) = message {
            args.push("-m");
            args.push(message);
        }

        args.push("--");
        args.extend(files);

        self.spawn_and_await(path, args)
            .or(Err(GitError::CreateStashFailed {}))
    }

    fn apply_stash(&self, path: &str, stash_id: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["stash", "pop", &format!("stash@{{{stash_id}}}")])
            .or(Err(GitError::ApplyStashFailed {
                stash_id: stash_id.to_string(),
            }))
    }

    fn discard_stash(&self, path: &str, stash_id: &str) -> Result<(), GitError> {
        self.spawn_and_await(path, ["stash", "drop", &format!("stash@{{{stash_id}}}")])
            .or(Err(GitError::DiscardStashFailed {
                stash_id: stash_id.to_string(),
            }))
    }
}
