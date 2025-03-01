use std::{fs, path::Path, str::FromStr};

use models::{
    BranchDivergence, BranchInfo, BranchType, ChangeStatus, CommitInfo, FileInfo, FileStatus,
    HeadInfo, HeadStatus, HistoryItem, MergeStatus, MovedStatus, RemoteRef, StatusType,
};

/// Format used to get the needed information about a commit, as a JSON-parseable string.
/// The commit message is included raw after a newline to allow parsing it without issues.
pub const COMMIT_INFO_FORMAT: &str = "--format=format:{\"hash\": \"%H\", \"short_hash\": \"%h\", \"author_name\": \"%an\", \"author_email\": \"%ae\", \"timestamp\": %ct}%n%B";
/// The prefix of the line with the commit hash when printing the current status.
pub const HEAD_INFO_COMMIT_PREFIX: &str = "# branch.oid ";
/// The prefix of the line with the branch name when printing the current status.
pub const HEAD_INFO_BRANCH_PREFIX: &str = "# branch.head ";
/// The prefix of all lines related to the HEAD info when printing the current status.
pub const HEAD_INFO_PREFIX: &str = "#";
/// The string that denotes that the current commit is the initial one when printing the current status.
pub const HEAD_INFO_INITIAL_COMMIT: &str = "(initial)";
/// The string that denotes that the HEAD is in a detached state when printing the current status.
pub const HEAD_INFO_DETACHED_BRANCH: &str = "(detached)";
/// The number of space-separated segments each line has for modified files.
pub const MODIFIED_FILE_INFO_SEGMENTS: usize = 9;
/// The number of space-separated segments each line has for moved files.
pub const MOVED_FILE_INFO_SEGMENTS: usize = 10;
/// The number of space-separated segments each line has for unmerged files.
pub const UNMERGED_FILE_INFO_SEGMENTS: usize = 11;
/// The number of space-separated segments each line has for untracked files.
pub const UNTRACKED_FILE_INFO_SEGMENTS: usize = 2;
/// Format used to get the needed information about branches.
pub const BRANCHES_INFO_FORMAT: &str =
    "--format=%(refname) %(committerdate:unix) %(upstream:remotename) %(upstream:remoteref)";
/// The string that denotes that a ref is a branch name when printing its status.
pub const BRANCH_PREFIX: &str = "refs/heads/";
/// The string that denotes that a branch is local when printing its status.
pub const REMOTE_BRANCH_PREFIX: &str = "refs/remotes/";

pub fn parse_commit_info(lines: &Vec<String>) -> Option<CommitInfo> {
    if let Some((line, rest)) = lines.split_first() {
        let mut info: CommitInfo = serde_json::from_str(line).ok()?;
        info.timestamp *= 1000;
        info.message = Some(rest.join("\n"));
        Some(info)
    } else {
        None
    }
}

pub fn parse_head_info(dir: &String, lines: &Vec<String>) -> Option<HeadInfo> {
    let head_status = parse_head_status(lines)?;
    let files_info = lines
        .iter()
        .skip_while(|line| line.starts_with(HEAD_INFO_PREFIX))
        .map(|line| parse_file_info(dir, line))
        .flatten();

    Some(HeadInfo {
        status: head_status,
        files: files_info.collect(),
    })
}

fn parse_head_status(lines: &Vec<String>) -> Option<HeadStatus> {
    let mut commit_line = lines
        .iter()
        .find(|line| line.starts_with(HEAD_INFO_COMMIT_PREFIX))?
        .clone();
    let mut branch_line = lines
        .iter()
        .find(|line| line.starts_with(HEAD_INFO_BRANCH_PREFIX))?
        .clone();

    commit_line.drain(0..HEAD_INFO_COMMIT_PREFIX.len());
    branch_line.drain(0..HEAD_INFO_BRANCH_PREFIX.len());

    match (commit_line.as_str(), branch_line.as_str()) {
        (HEAD_INFO_INITIAL_COMMIT, HEAD_INFO_DETACHED_BRANCH) => None,
        (commit_id, HEAD_INFO_DETACHED_BRANCH) => Some(HeadStatus::Detached {
            commit: commit_id.to_string(),
        }),
        (HEAD_INFO_INITIAL_COMMIT, branch_name) => Some(HeadStatus::Initial {
            branch: branch_name.to_string(),
        }),
        (_, branch_name) => Some(HeadStatus::Branch {
            name: branch_name.to_string(),
        }),
    }
}

fn parse_file_info(dir: &String, line: &String) -> Option<FileInfo> {
    let status_str = line.chars().nth(0)?.to_string();
    let status_type = StatusType::from_str(&status_str).ok()?;

    Some(match status_type {
        StatusType::Modified => {
            let segments: Vec<&str> = line.splitn(MODIFIED_FILE_INFO_SEGMENTS, ' ').collect();
            let (staged_str, unstaged_str) = segments.get(1)?.split_at(1);
            let staged_status = ChangeStatus::from_str(staged_str).ok()?;
            let unstaged_status = ChangeStatus::from_str(unstaged_str).ok()?;
            let path = segments.last()?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Modified {
                    staged: staged_status,
                    unstaged: unstaged_status,
                },
                is_dir: is_dir(dir, path),
            }
        }

        StatusType::Moved => {
            let segments: Vec<&str> = line.splitn(MOVED_FILE_INFO_SEGMENTS, ' ').collect();
            let (staged_str, unstaged_str) = segments.get(1)?.split_at(1);
            let moved_status = MovedStatus::from_str(staged_str).ok()?;
            let unstaged_status = ChangeStatus::from_str(unstaged_str).ok()?;

            let path_segment = segments.last()?;
            let (path, old_path) = path_segment.split_once('\t')?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Moved {
                    from: old_path.to_string(),
                    staged: moved_status,
                    unstaged: unstaged_status,
                },
                is_dir: is_dir(dir, path),
            }
        }

        StatusType::Unmerged => {
            let segments: Vec<&str> = line.splitn(UNMERGED_FILE_INFO_SEGMENTS, ' ').collect();
            let merge_status = MergeStatus::from_str(segments.get(1)?).ok()?;
            let path = segments.last()?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Unmerged {
                    unstaged: merge_status,
                },
                is_dir: is_dir(dir, path),
            }
        }

        StatusType::Untracked => {
            let segments: Vec<&str> = line.splitn(UNTRACKED_FILE_INFO_SEGMENTS, ' ').collect();
            let path = segments.last()?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Untracked {},
                is_dir: is_dir(dir, path),
            }
        }
    })
}

pub fn parse_history_item(line: &String) -> Option<HistoryItem> {
    let mut commits = line.split_ascii_whitespace().map(String::from);
    let hash = commits.next()?;
    let parents = commits.skip(1).collect();

    Some(HistoryItem {
        hash: hash.to_string(),
        other_parents: parents,
    })
}

pub fn parse_branch_info(line: &String) -> Option<BranchInfo> {
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

pub fn parse_branch_divergence(line: &String) -> Option<BranchDivergence> {
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
