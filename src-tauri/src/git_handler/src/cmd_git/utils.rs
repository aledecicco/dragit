use std::{fs, path::Path, str::FromStr};

use models::{
    BranchDivergence, BranchInfo, BranchType, ChangeStatus, CommitInfo, DiffSummary, HeadInfo,
    HistoryItem, MergeStatus, MovedStatus, RemoteInfo, RemoteRef, StagedFileInfo, StagedFileStatus,
    StashInfo, StatusType, UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo,
};

/// Format used to get the needed information about a commit.
pub(crate) const COMMIT_INFO_FORMAT: &str = "--format=format:%H%n%h%n%an%n%ae%n%ct%n%B";
/// The prefix of the line with the commit hash when printing the current status.
pub(crate) const HEAD_INFO_COMMIT_PREFIX: &str = "# branch.oid ";
/// The prefix of the line with the branch name when printing the current status.
pub(crate) const HEAD_INFO_BRANCH_PREFIX: &str = "# branch.head ";
/// The prefix of all lines related to the HEAD info when printing the current status.
pub(crate) const HEAD_INFO_PREFIX: &str = "#";
/// The string that denotes that the current commit is the initial one when printing the current status.
pub(crate) const HEAD_INFO_INITIAL_COMMIT: &str = "(initial)";
/// The string that denotes that the HEAD is in a detached state when printing the current status.
pub(crate) const HEAD_INFO_DETACHED_BRANCH: &str = "(detached)";
/// The number of space-separated segments each line has for modified files.
pub(crate) const MODIFIED_FILE_INFO_SEGMENTS: usize = 9;
/// The number of space-separated segments each line has for moved files.
pub(crate) const MOVED_FILE_INFO_SEGMENTS: usize = 10;
/// The number of space-separated segments each line has for unmerged files.
pub(crate) const UNMERGED_FILE_INFO_SEGMENTS: usize = 11;
/// The number of space-separated segments each line has for untracked files.
pub(crate) const UNTRACKED_FILE_INFO_SEGMENTS: usize = 2;
/// Format used to get the needed information about branches.
pub(crate) const BRANCHES_INFO_FORMAT: &str =
    "--format=%(refname) %(committerdate:unix) %(upstream:remotename) %(upstream:remoteref)";
/// The string that denotes that a ref is a branch name when printing its status.
pub(crate) const BRANCH_PREFIX: &str = "refs/heads/";
/// The string that denotes that a branch is local when printing its status.
pub(crate) const REMOTE_BRANCH_PREFIX: &str = "refs/remotes/";
/// Format used to get the needed information about a stash.
pub(crate) const STASH_INFO_FORMAT: &str = "--format=format:%n%p%n%gd%n%ct%n%s";
/// The string that denotes that a stash was created from a detached state.
pub(crate) const STASH_INFO_DETACHED: &str = "(no branch)";
/// The string that denotes that a stash was created using the shorthand, without a message.
pub(crate) const STASH_INFO_QUICK: &str = "WIP";

pub(crate) fn parse_commit_info(lines: &Vec<String>) -> Option<CommitInfo> {
    Some(CommitInfo {
        hash: lines.get(0)?.to_string(),
        short_hash: lines.get(1)?.to_string(),
        author_name: lines.get(2)?.to_string(),
        author_email: lines.get(3)?.to_string(),
        timestamp: u64::from_str(lines.get(4)?).ok()? * 1000,
        message: lines.get(5..).map(|message| message.join("\n")),
    })
}

pub(crate) fn parse_head_info(lines: &Vec<String>) -> Option<HeadInfo> {
    let commit = lines.get(0)?.strip_prefix(HEAD_INFO_COMMIT_PREFIX)?;
    let branch = lines.get(1)?.strip_prefix(HEAD_INFO_BRANCH_PREFIX)?;

    match (commit, branch) {
        (HEAD_INFO_INITIAL_COMMIT, HEAD_INFO_DETACHED_BRANCH) => None,
        (commit_id, HEAD_INFO_DETACHED_BRANCH) => Some(HeadInfo::Detached {
            commit: commit_id.to_string(),
        }),
        (_, branch_name) => Some(HeadInfo::Branch {
            name: branch_name.to_string(),
        }),
    }
}

pub(crate) fn parse_staged_file_info(line: &String) -> Option<StagedFileInfo> {
    let status_str = line.chars().nth(0)?.to_string();
    let status_type = StatusType::from_str(&status_str).ok()?;

    Some(match status_type {
        StatusType::Modified => {
            let segments: Vec<&str> = line.splitn(MODIFIED_FILE_INFO_SEGMENTS, ' ').collect();
            let staged_str = segments.get(1)?.get(..1)?;
            let staged_status = ChangeStatus::from_str(staged_str).ok()?;
            let path = segments.last()?;

            StagedFileInfo {
                path: path.to_string(),
                status: StagedFileStatus::Changed {
                    changes: staged_status,
                },
            }
        }

        StatusType::Moved => {
            let segments: Vec<&str> = line.splitn(MOVED_FILE_INFO_SEGMENTS, ' ').collect();
            let staged_str = segments.get(1)?.get(..1)?;
            let moved_status = MovedStatus::from_str(staged_str).ok()?;

            let path_segment = segments.last()?;
            let (path, old_path) = path_segment.split_once('\t')?;

            StagedFileInfo {
                path: path.to_string(),
                status: StagedFileStatus::Moved {
                    changes: moved_status,
                    old_path: old_path.to_string(),
                },
            }
        }
        _ => None?,
    })
}

pub(crate) fn parse_unstaged_file_info(line: &String) -> Option<UnstagedFileInfo> {
    let status_str = line.chars().nth(0)?.to_string();
    let status_type = StatusType::from_str(&status_str).ok()?;

    Some(match status_type {
        StatusType::Modified => {
            let segments: Vec<&str> = line.splitn(MODIFIED_FILE_INFO_SEGMENTS, ' ').collect();
            let unstaged_str = segments.get(1)?.get(1..)?;
            let unstaged_status = ChangeStatus::from_str(unstaged_str).ok()?;
            let path = segments.last()?;

            UnstagedFileInfo {
                path: path.to_string(),
                status: unstaged_status,
            }
        }
        _ => None?,
    })
}

pub(crate) fn parse_unmerged_file_info(line: &String) -> Option<UnmergedFileInfo> {
    let status_str = line.chars().nth(0)?.to_string();
    let status_type = StatusType::from_str(&status_str).ok()?;

    Some(match status_type {
        StatusType::Unmerged => {
            let segments: Vec<&str> = line.splitn(UNMERGED_FILE_INFO_SEGMENTS, ' ').collect();
            let merge_status = MergeStatus::from_str(segments.get(1)?).ok()?;
            let path = segments.last()?;

            UnmergedFileInfo {
                path: path.to_string(),
                status: merge_status,
            }
        }
        _ => None?,
    })
}

pub(crate) fn parse_untracked_file_info(line: &String) -> Option<UntrackedFileInfo> {
    let status_str = line.chars().nth(0)?.to_string();
    let status_type = StatusType::from_str(&status_str).ok()?;

    Some(match status_type {
        StatusType::Untracked => {
            let segments: Vec<&str> = line.splitn(UNTRACKED_FILE_INFO_SEGMENTS, ' ').collect();
            let path = segments.last()?;

            UntrackedFileInfo {
                path: path.to_string(),
            }
        }
        _ => None?,
    })
}

pub(crate) fn parse_history_item(line: &String) -> Option<HistoryItem> {
    let mut commits = line.split_ascii_whitespace().map(String::from);
    let hash = commits.next()?;
    let parents = commits.skip(1).collect();

    Some(HistoryItem {
        hash: hash.to_string(),
        other_parents: parents,
    })
}

pub(crate) fn parse_branch_info(line: &String) -> Option<BranchInfo> {
    let mut segments = line.split_ascii_whitespace().map(String::from);
    let branch_name = segments.next()?;
    let timestamp = u64::from_str(&segments.next()?).ok()? * 1000;

    if branch_name.starts_with(BRANCH_PREFIX) {
        let remote_name = segments.next();
        let remote_branch_name = segments.next();

        Some(BranchInfo {
            name: strip_branch_prefix(&branch_name, BRANCH_PREFIX),
            timestamp: timestamp,
            branch_type: BranchType::Local {
                remote: match (remote_name, remote_branch_name) {
                    (Some(remote_name), Some(remote_branch_name)) => Some(RemoteRef {
                        remote_name,
                        branch_name: strip_branch_prefix(&remote_branch_name, BRANCH_PREFIX),
                    }),
                    _ => None,
                },
            },
        })
    } else if branch_name.starts_with(REMOTE_BRANCH_PREFIX) {
        Some(BranchInfo {
            name: strip_branch_prefix(&branch_name, REMOTE_BRANCH_PREFIX),
            timestamp: timestamp,
            branch_type: BranchType::Remote {},
        })
    } else {
        None
    }
}

pub(crate) fn parse_branch_divergence(line: &String) -> Option<BranchDivergence> {
    let mut divergence = line.split_ascii_whitespace().map(String::from);
    let ahead = u64::from_str(&divergence.next()?).ok()?;
    let behind = u64::from_str(&divergence.next()?).ok()?;

    Some(BranchDivergence { ahead, behind })
}

fn is_dir(dir: &String, path: &str) -> bool {
    let full_path = Path::new(dir).join(path);
    if let Ok(metadata) = fs::metadata(full_path) {
        metadata.is_dir()
    } else {
        false
    }
}

fn strip_branch_prefix(full_name: &String, prefix: &str) -> String {
    match full_name.strip_prefix(prefix) {
        Some(short_name) => short_name.to_string(),
        None => full_name.to_string(),
    }
}

pub(crate) fn parse_remote_infos(lines: &Vec<String>) -> Vec<RemoteInfo> {
    lines
        .chunks_exact(2)
        .filter_map(|pair| {
            let fetch_line: Vec<&str> = pair.iter().nth(0)?.split_ascii_whitespace().collect();
            let push_line: Vec<&str> = pair.iter().nth(1)?.split_ascii_whitespace().collect();

            Some(RemoteInfo {
                name: fetch_line.get(0)?.to_string(),
                fetch_url: fetch_line.get(1)?.to_string(),
                push_url: push_line.get(1)?.to_string(),
            })
        })
        .collect()
}

fn parse_diff_summary(line: &String) -> Option<DiffSummary> {
    if line.is_empty() {
        return None;
    }

    let segments: Vec<&str> = line.split(',').collect();
    let files_count = u64::from_str(segments.get(0)?.trim_ascii()).ok()?;
    let insertions = u64::from_str(segments.get(1)?.trim_ascii()).ok()?;
    let deletions = u64::from_str(segments.get(2)?.trim_ascii()).ok()?;

    Some(DiffSummary {
        files_count,
        insertions,
        deletions,
    })
}

fn parse_stash_info(body_lines: Vec<&String>, diff_line: Option<&String>) -> Option<StashInfo> {
    let hashes_line = body_lines.get(0)?;
    let name_line = body_lines.get(1)?;
    let timestamp_line = body_lines.get(2)?;
    let creation_line = body_lines.get(3)?;

    let name = name_line.to_string();
    let timestamp = u64::from_str(timestamp_line).ok()? * 1000;
    let (creation_details, message) = creation_line.split_once(':')?;
    let mut creation_details = creation_details.split_ascii_whitespace();
    let message = if creation_details.next()?.eq(STASH_INFO_QUICK) {
        None
    } else {
        Some((&message[1..]).to_string())
    };
    let created_on = match creation_details.last()? {
        STASH_INFO_DETACHED => hashes_line.split_ascii_whitespace().last()?,
        created_on => created_on,
    }
    .to_string();

    Some(StashInfo {
        name,
        message,
        timestamp,
        created_on,
        changes: diff_line.and_then(parse_diff_summary),
    })
}

pub(crate) fn parse_stash_infos(lines: &Vec<String>) -> Vec<StashInfo> {
    let mut lines = lines.iter().peekable();
    let mut stashes = Vec::new();

    while lines.peek().is_some() {
        let lines = lines.by_ref();
        let body_lines = lines.take(4).collect();
        let diff_line = lines.next();

        if let Some(stash_info) = parse_stash_info(body_lines, diff_line) {
            stashes.push(stash_info);
        }
    }

    stashes
}
