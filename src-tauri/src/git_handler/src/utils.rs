use std::str::FromStr;

use models::{
    ChangeStatus, CommitInfo, FileInfo, FileStatus, HeadInfo, HeadStatus, MergeStatus, MovedStatus,
    StatusType,
};

pub const COMMIT_INFO_FORMAT: &str = "--format=format:{\"hash\": \"%H\", \"short_hash\": \"%h\", \"author_name\": \"%an\", \"author_email\": \"%ae\", \"timestamp\": %ct}%n%B";
pub const HEAD_INFO_COMMIT_PREFIX: &str = "# branch.oid ";
pub const HEAD_INFO_BRANCH_PREFIX: &str = "# branch.head ";
pub const HEAD_INFO_PREFIX: &str = "#";
pub const INITIAL_COMMIT: &str = "(initial)";
pub const DETACHED_BRANCH: &str = "(detached)";

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

pub fn parse_head_info(lines: &Vec<String>) -> Option<HeadInfo> {
    let head_status = parse_head_status(lines)?;
    let files_info = lines
        .iter()
        .skip_while(|line| line.starts_with(HEAD_INFO_PREFIX))
        .map(|line| parse_file_info(line))
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
        (INITIAL_COMMIT, DETACHED_BRANCH) => None,
        (commit_id, DETACHED_BRANCH) => Some(HeadStatus::Detached {
            commit: commit_id.to_string(),
        }),
        (INITIAL_COMMIT, branch_name) => Some(HeadStatus::Initial {
            branch: branch_name.to_string(),
        }),
        (_, branch_name) => Some(HeadStatus::Branch {
            name: branch_name.to_string(),
        }),
    }
}

fn parse_file_info(line: &String) -> Option<FileInfo> {
    let segments: Vec<&str> = line.split(" ").collect();
    let status_type = StatusType::from_str(segments.get(0)?).ok()?;

    Some(match status_type {
        StatusType::Normal => {
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
            }
        }
        StatusType::Renamed => {
            let (staged_str, unstaged_str) = segments.get(1)?.split_at(1);
            let moved_status = MovedStatus::from_str(staged_str).ok()?;
            let unstaged_status = ChangeStatus::from_str(unstaged_str).ok()?;
            let old_path = segments.last()?;
            let path = segments.get(segments.len() - 2)?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Renamed {
                    from: old_path.to_string(),
                    status: moved_status,
                    unstaged: unstaged_status,
                },
            }
        }
        StatusType::Conflict => {
            let merge_status = MergeStatus::from_str(segments.get(1)?).ok()?;
            let path = segments.last()?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Unmerged {
                    status: merge_status,
                },
            }
        }
        StatusType::Untracked => {
            let path = segments.last()?;

            FileInfo {
                path: path.to_string(),
                status: FileStatus::Untracked {},
            }
        }
    })
}
