mod utils;
use utils::*;

use std::{
    collections::HashMap,
    fmt::Debug,
    fs,
    io::{BufRead, BufReader, Lines, Read},
    path::Path,
    process::{Child, ChildStdout, Command, Stdio},
};
use tauri::ipc::Channel;

use ::utils::{
    get_cherry_pick_head_file, get_merge_head_file, get_rebase_head_file, get_revert_head_file,
};

use models::{
    AncestorInfo, AppMessage, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo,
    FileTypesFilter, GitError, GitHandler, HeadInfo, HistoryItem, Page, RemoteInfo,
    ResolutionStrategy, SnapshotInfo, StashInfo, VersionedFileInfo, WorktreeFileInfo,
    WorktreeStatus,
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

        cmd.current_dir(path).args(&args_vec).stdout(Stdio::piped());

        #[cfg(windows)]
        {
            // Avoid opening a new console window for the git process on Windows.
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }

        cmd.spawn().or(Err(GitError::StartCommandFailed {
            args: args_vec.into_iter().map(String::from).collect(),
        }))
    }

    fn await_child(&self, mut process: Child) -> Result<(), GitError> {
        let status = process
            .wait()
            .map_err(|_| GitError::GetCommandOutputFailed {})?;

        if status.success() {
            Ok(())
        } else {
            Err(GitError::GetCommandOutputFailed {})
        }
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
        I: IntoIterator<Item = &'a str> + Debug,
    {
        let res = self.spawn_command(path, args)?;
        self.await_child(res)
    }

    fn get_output_lines_stream<'a>(
        &self,
        process: Child,
    ) -> Result<Lines<BufReader<ChildStdout>>, GitError> {
        let stdout = process.stdout.ok_or(GitError::GetCommandOutputFailed {})?;

        let reader = BufReader::new(stdout);
        Ok(reader.lines())
    }

    fn get_all_output<'a>(&self, mut process: Child) -> Result<String, GitError> {
        let stdout = process
            .stdout
            .take()
            .ok_or(GitError::GetCommandOutputFailed {})?;

        let mut buffer = String::new();
        BufReader::new(stdout)
            .read_to_string(&mut buffer)
            .map_err(|_| GitError::GetCommandOutputFailed {})?;

        self.await_child(process)?;

        Ok(buffer)
    }
}

impl GitHandler for CmdGit {
    fn init_repository(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["init"])
    }

    fn is_repository(&self, repo_path: &str) -> bool {
        self.spawn_and_await(repo_path, ["rev-parse"]).is_ok()
    }

    fn get_branches(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<BranchInfo>, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
            ["branch", "--list", "-a", BRANCHES_INFO_FORMAT],
        )?;
        let lines = self.get_output_lines_stream(process)?;
        let branches: Vec<_> = lines
            .filter_map(|line| line.ok().and_then(|line| parse_branch_info(&line)))
            .collect();

        Ok(branches)
    }

    fn checkout(
        &self,
        repo_path: &str,
        reference: &str,
        is_new: bool,
        from_reference: Option<&str>,
    ) -> Result<(), GitError> {
        let mut args = vec!["checkout"];
        if is_new {
            args.push("-b");
        }
        args.push(reference);
        if let Some(from_reference) = from_reference {
            args.push(from_reference);
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CheckoutFailed {
                reference: reference.to_string(),
            }))
    }

    fn create_branch(
        &self,
        repo_path: &str,
        branch_name: &str,
        from_reference: Option<&str>,
    ) -> Result<(), GitError> {
        let mut args = vec!["branch", branch_name];
        if let Some(from_reference) = from_reference {
            args.push(from_reference);
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CreateBranchFailed {
                branch_name: branch_name.to_string(),
            }))
    }

    fn delete_local_branches(
        &self,
        repo_path: &str,
        branch_names: &Vec<&str>,
    ) -> Result<(), GitError> {
        let mut args = vec!["branch", "-D"];
        args.extend(branch_names);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::DeleteBranchesFailed {}))
    }

    fn delete_remote_branches(
        &self,
        repo_path: &str,
        branch_names: &Vec<&str>,
        remote: &str,
    ) -> Result<(), GitError> {
        let mut args = vec!["push", remote, "--delete"];
        args.extend(branch_names);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::DeleteBranchesFailed {}))
    }

    fn get_commit_history_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<HistoryItem>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = (limit + 1).to_string();
        let reference_arg = reference.to_string() + "~" + &page_arg;

        let process = self.spawn_and_notify(
            channel,
            repo_path,
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
        repo_path: &str,
        reference: &str,
    ) -> Result<CommitInfo, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
            [
                "show",
                reference,
                COMMIT_INFO_FORMAT,
                "--quiet",
                "--shortstat",
                "--first-parent",
            ],
        )?;
        let output = self.get_all_output(process)?;
        parse_commit_info(&output).ok_or(GitError::GetCommitInfoFailed {
            reference: reference.to_string(),
        })
    }

    fn get_head_info(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<HeadInfo, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
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
        let lines = self
            .get_all_output(process)?
            .lines()
            .map(String::from)
            .collect();

        let head_state = parse_head_state(&lines).ok_or(GitError::GetHeadInfoFailed {})?;

        let merge_in_progress =
            fs::exists(get_merge_head_file(&Path::new(repo_path))).unwrap_or(false);
        let rebase_in_progress =
            fs::exists(get_rebase_head_file(&Path::new(repo_path))).unwrap_or(false);
        let cherry_pick_in_progress =
            fs::exists(get_cherry_pick_head_file(&Path::new(repo_path))).unwrap_or(false);
        let revert_in_progress =
            fs::exists(get_revert_head_file(&Path::new(repo_path))).unwrap_or(false);

        Ok(HeadInfo {
            state: head_state,
            worktree_status: if merge_in_progress {
                WorktreeStatus::Merging
            } else if rebase_in_progress {
                WorktreeStatus::Rebasing
            } else if cherry_pick_in_progress {
                WorktreeStatus::CherryPicking
            } else if revert_in_progress {
                WorktreeStatus::Reverting
            } else {
                WorktreeStatus::Clean
            },
        })
    }

    fn get_worktree_files_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        filter: &FileTypesFilter,
        pathspec: Option<&str>,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<WorktreeFileInfo>, GitError> {
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

        let parse_line = |line: String| -> Option<WorktreeFileInfo> {
            if filter.staged.unwrap_or(false) {
                if let Some(info) = parse_staged_file_info(&line) {
                    return Some(WorktreeFileInfo::Staged(info));
                }
            }
            if filter.unstaged.unwrap_or(false) {
                if let Some(info) = parse_unstaged_file_info(&line) {
                    return Some(WorktreeFileInfo::Unstaged(info));
                }
            }
            if filter.unmerged.unwrap_or(false) {
                if let Some(info) = parse_unmerged_file_info(&line) {
                    return Some(WorktreeFileInfo::Unmerged(info));
                }
            }
            if filter.untracked.unwrap_or(false) {
                if let Some(info) = parse_untracked_file_info(&line) {
                    return Some(WorktreeFileInfo::Untracked(info));
                }
            }

            None
        };

        let process = self.spawn_and_notify(channel, repo_path, args)?;
        let lines = self.get_output_lines_stream(process)?;

        let mut items_iter = lines
            .filter_map(|line| line.ok().and_then(parse_line))
            .skip(start_after);
        let items: Vec<_> = items_iter.by_ref().take(limit).collect();
        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
    }

    fn get_snapshot_files_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        snapshot: &SnapshotInfo,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<VersionedFileInfo>, GitError> {
        let parent;
        let args = match snapshot {
            SnapshotInfo::Commit(commit) => {
                parent = format!("{}^{}", commit.id, 1);
                vec![
                    "diff-tree",
                    "-r",
                    "--root",
                    "--name-status",
                    "--find-copies",
                    "--no-commit-id",
                    &parent,
                    &commit.id,
                ]
            }
            SnapshotInfo::Stash(stash) => vec![
                "stash",
                "show",
                "-r",
                "-u",
                "--name-status",
                "--find-copies",
                "--no-commit-id",
                &stash.id,
            ],
        };

        // TODO: doesn't work for initial commit
        let process = self.spawn_and_notify(channel, repo_path, args)?;
        let lines = self.get_output_lines_stream(process)?;

        let mut items_iter = lines
            .filter_map(|line| line.ok().and_then(|line| parse_versioned_file_info(&line)))
            .skip(start_after);
        let items: Vec<_> = items_iter.by_ref().take(limit).collect();
        let has_next = items_iter.next().is_some();

        Ok(Page { items, has_next })
    }

    fn add_to_index(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let mut args = vec!["add"];
        args.extend(files);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::AddToIndexFailed {}))
    }

    fn remove_from_index(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let mut args = vec!["reset", "--"];
        args.extend(files);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::RemoveFromIndexFailed {}))
    }

    fn remove_from_tree(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let mut args = vec!["rm"];
        args.extend(files);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::RemoveFromTreeFailed {}))
    }

    fn clean_files(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError> {
        let mut args = vec!["clean", "-f", "--"];
        args.extend(files);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CleanFilesFailed {}))
    }

    fn commit_index(&self, repo_path: &str, message: &str, is_amend: bool) -> Result<(), GitError> {
        let mut args = vec!["commit", "-m", message];

        if is_amend {
            args.push("--amend");
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CommitFailed {}))
    }

    fn reset_head(&self, repo_path: &str, reference: &str) -> Result<(), GitError> {
        let parent = format!("{}^{}", reference, 1);
        self.spawn_and_await(repo_path, ["reset", "--soft", &parent])
            .or(Err(GitError::ResetHeadFailed {
                reference: reference.to_string(),
            }))
    }

    fn restore(
        &self,
        repo_path: &str,
        reference: Option<&str>,
        is_staged: bool,
        is_worktree: bool,
        files: &Vec<&str>,
    ) -> Result<(), GitError> {
        let mut args = vec!["restore"];

        if let Some(reference) = reference {
            args.push("--source");
            args.push(reference);
        }

        if is_staged {
            args.push("--staged");
        }

        if is_worktree {
            args.push("--worktree");
        }

        args.push("--");
        args.extend(files);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::RestoreFailed {}))
    }

    fn get_common_ancestor(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference_a: &str,
        reference_b: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError> {
        let process_a = self.spawn_and_notify(
            channel,
            repo_path,
            ["rev-list", "--first-parent", reference_a],
        )?;
        let process_b = self.spawn_and_notify(
            channel,
            repo_path,
            ["rev-list", "--first-parent", reference_b],
        )?;

        let mut iter_a = self
            .get_output_lines_stream(process_a)?
            .filter_map(Result::ok);
        let mut iter_b = self
            .get_output_lines_stream(process_b)?
            .filter_map(Result::ok);

        let mut prev_ref_a_pointer = None;
        let mut ref_a_pointer = iter_a.next().map(|hash| (hash, 0));
        let mut ref_b_pointer = iter_b.next().map(|hash| (hash, 0));

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
                ref_a_pointer = iter_a.next().map(|hash| (hash, ref_a_distance + 1))
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
                ref_b_pointer = iter_b.next().map(|hash| (hash, ref_b_distance + 1))
            }

            if ref_a_pointer.is_none() && ref_b_pointer.is_none() {
                return Ok(None);
            }
        }
    }

    fn get_branch_divergence(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
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
        repo_path: &str,
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

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::PushBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))
    }

    fn pull_branch(
        &self,
        repo_path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_rebase: bool,
    ) -> Result<(), GitError> {
        let remote_ref = format!("{}:{}", branch, remote_branch);
        let mut args = vec!["pull", remote, &remote_ref];

        if is_rebase {
            args.push("--rebase");
        } else {
            args.push("--no-rebase");
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::PullBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))
    }

    fn fast_forward_branch(
        &self,
        repo_path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
    ) -> Result<(), GitError> {
        let remote_ref = format!("+{}:{}", branch, remote_branch);
        let args = vec!["fetch", remote, &remote_ref];

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::FastForwardBranchFailed {
                branch: branch.to_string(),
                remote: remote.to_string(),
                remote_branch: remote_branch.to_string(),
            }))
    }

    fn get_remotes(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<RemoteInfo>, GitError> {
        let process = self.spawn_and_notify(channel, repo_path, ["remote", "--verbose"])?;
        let lines: Vec<String> = self
            .get_all_output(process)?
            .lines()
            .map(String::from)
            .collect();

        Ok(parse_remote_infos(&lines))
    }

    fn fetch_remote(&self, repo_path: &str, name: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["fetch", name, "--tags"])
            .or(Err(GitError::FetchRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn set_upstream(
        &self,
        repo_path: &str,
        branch: &str,
        remote_ref: &str,
    ) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["branch", "-u", remote_ref, branch])
            .or(Err(GitError::SetUpstreamFailed {
                branch: branch.to_string(),
                remote_ref: remote_ref.to_string(),
            }))
    }

    fn add_remote(&self, repo_path: &str, name: &str, url: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["remote", "add", name, url])
            .or(Err(GitError::AddRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn remove_remote(&self, repo_path: &str, name: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["remote", "remove", name])
            .or(Err(GitError::RemoveRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn rename_remote(&self, repo_path: &str, name: &str, new_name: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["remote", "rename", name, new_name])
            .or(Err(GitError::RenameRemoteFailed {
                name: name.to_string(),
            }))
    }

    fn change_remote_url(
        &self,
        repo_path: &str,
        name: &str,
        new_url: &str,
    ) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["remote", "set-url", name, new_url])
            .or(Err(GitError::ChangeRemoteUrlFailed {
                name: name.to_string(),
            }))
    }

    fn get_stashes(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<StashInfo>, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
            ["stash", "list", STASH_INFO_FORMAT, "--shortstat"],
        )?;
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
        repo_path: &str,
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

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CreateStashFailed {}))
    }

    fn apply_stash(&self, repo_path: &str, stash_id: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["stash", "pop", &stash_id])
            .or(Err(GitError::ApplyStashFailed {
                stash_id: stash_id.to_string(),
            }))
    }

    fn discard_stashes(&self, repo_path: &str, stash_ids: &Vec<&str>) -> Result<(), GitError> {
        // Discard stashes in descending order to avoid index shifting issues.
        let mut sorted_ids = stash_ids.iter().cloned().collect::<Vec<&str>>();
        sorted_ids.sort_by(|a, b| b.cmp(a));

        for stash_id in sorted_ids {
            self.spawn_and_await(repo_path, ["stash", "drop", stash_id])
                .or(Err(GitError::DiscardStashFailed {
                    stash_id: stash_id.to_string(),
                }))?;
        }

        Ok(())
    }

    fn get_tags(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<models::TagInfo>, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
            ["for-each-ref", "refs/tags", TAG_INFO_FORMAT],
        )?;

        let output = self.get_all_output(process)?;
        let segments = output.split('\0');

        segments
            .collect::<Vec<&str>>()
            .chunks_exact(8)
            .map(|chunk| {
                parse_tag_info(&chunk.iter().skip(1).map(|&s| s.to_string()).collect())
                    .ok_or(GitError::GetTagsFailed {})
            })
            .collect()
    }

    fn tag(
        &self,
        repo_path: &str,
        tag_name: &str,
        reference: &str,
        message: Option<&str>,
    ) -> Result<(), GitError> {
        let mut args = vec!["tag", tag_name, reference];

        if let Some(message) = message {
            args.push("-m");
            args.push(message);
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::TagFailed {
                name: tag_name.to_string(),
                reference: reference.to_string(),
            }))
    }

    fn push_tag(&self, repo_path: &str, tag: &str, remote: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["push", remote, tag])
            .or(Err(GitError::PushTagFailed {
                tag: tag.to_string(),
                remote: remote.to_string(),
            }))
    }

    fn delete_local_tags(&self, repo_path: &str, tag_names: &Vec<&str>) -> Result<(), GitError> {
        let mut args = vec!["tag", "-d"];
        args.extend(tag_names);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::DeleteTagsFailed {}))
    }

    fn delete_remote_tags(
        &self,
        repo_path: &str,
        tag_names: &Vec<&str>,
        remote: &str,
    ) -> Result<(), GitError> {
        let mut args = vec!["push", remote, "--delete"];
        args.extend(tag_names);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::DeleteTagsFailed {}))
    }

    fn get_file_contents(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference: &str,
        filepath: &str,
    ) -> Result<String, GitError> {
        let process = self.spawn_and_notify(
            channel,
            repo_path,
            ["show", &format!("{}:{}", reference, filepath)],
        )?;

        Ok(self
            .get_all_output(process)
            .or(Err(GitError::GetFileContentsFailed {
                reference: reference.to_string(),
                filepath: filepath.to_string(),
            }))?)
    }

    fn solve_file_conflicts(
        &self,
        repo_path: &str,
        files: &Vec<&str>,
        strategy: &ResolutionStrategy,
    ) -> Result<(), GitError> {
        let mut args = vec!["checkout"];
        args.extend(files);

        match strategy {
            ResolutionStrategy::Ours => args.push("--ours"),
            ResolutionStrategy::Theirs => args.push("--theirs"),
        }

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::SolveFileConflictsFailed {}))
    }

    fn abort_merge(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["merge", "--abort"])
            .or(Err(GitError::AbortMergeFailed {}))
    }

    fn continue_merge(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["merge", "--continue"])
            .or(Err(GitError::ContinueMergeFailed {}))
    }

    fn abort_rebase(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["rebase", "--abort"])
            .or(Err(GitError::AbortRebaseFailed {}))
    }

    fn continue_rebase(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["rebase", "--continue"])
            .or(Err(GitError::ContinueRebaseFailed {}))
    }

    fn continue_cherry_pick(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["cherry-pick", "--continue"])
            .or(Err(GitError::ContinueCherryPickFailed {}))
    }

    fn abort_cherry_pick(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["cherry-pick", "--abort"])
            .or(Err(GitError::AbortCherryPickFailed {}))
    }

    fn continue_revert(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["revert", "--continue"])
            .or(Err(GitError::ContinueRevertFailed {}))
    }

    fn abort_revert(&self, repo_path: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["revert", "--abort"])
            .or(Err(GitError::AbortRevertFailed {}))
    }

    fn merge(&self, repo_path: &str, reference: &str) -> Result<(), GitError> {
        self.spawn_and_await(repo_path, ["merge", reference])
            .or(Err(GitError::MergeFailed {
                reference: reference.to_string(),
            }))
    }

    fn cherry_pick(
        &self,
        repo_path: &str,
        references: &Vec<&str>,
        is_merge: bool,
    ) -> Result<(), GitError> {
        let mut args = vec!["cherry-pick"];

        if is_merge {
            args.push("-m");
            args.push("1");
        }

        args.push("--");
        args.extend(references);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::CherryPickFailed {}))
    }

    fn revert_commit(
        &self,
        repo_path: &str,
        reference: &str,
        is_merge: bool,
    ) -> Result<(), GitError> {
        let mut args = vec!["revert"];

        if is_merge {
            args.push("-m");
            args.push("1");
        }

        args.push("--");
        args.push(reference);

        self.spawn_and_await(repo_path, args)
            .or(Err(GitError::RevertCommitFailed {
                reference: reference.to_string(),
            }))
    }
}
