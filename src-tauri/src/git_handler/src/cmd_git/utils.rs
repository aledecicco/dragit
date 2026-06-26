use std::{io::Read, str::FromStr, u32};

use models::{
    BranchDivergence, BranchInfo, ChangeStatus, CommitInfo, DiffSummary, HeadState, HistoryItem,
    MergeStatus, MovedStatus, RemoteInfo, StagedFileInfo, StagedFileStatus, StashInfo, StatusType,
    TagInfo, UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo, Upstream, VersionedFileInfo,
    VersionedFileStatus,
};

/// Format used to get the needed information about a commit.
pub(crate) const COMMIT_INFO_FORMAT: &str =
    "--format=format:%H%x00%h%x00%an%x00%ae%x00%ct%x00%B%x00%ph%x00";
/// The prefix of the line with the commit hash when printing the current status.
pub(crate) const HEAD_INFO_COMMIT_PREFIX: &str = "# branch.oid ";
/// The prefix of the line with the branch name when printing the current status.
pub(crate) const HEAD_INFO_BRANCH_PREFIX: &str = "# branch.head ";
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
pub(crate) const STASH_INFO_FORMAT: &str = "--format=format:%p%n%gd%n%ct%n%s";
/// The string that precedes the stash identifier.
pub(crate) const STASH_NAME_PREFIX: &str = "stash@{";
/// The string that denotes that a stash was created from a detached state.
pub(crate) const STASH_INFO_DETACHED: &str = "(no branch)";
/// The string that denotes that a stash was created using the shorthand, without a message.
pub(crate) const STASH_INFO_QUICK: &str = "WIP";
/// Format used to get the needed information about a tag.
pub(crate) const TAG_INFO_FORMAT: &str =
    "--format=%00%(refname:short)%00%(*objectname:short)%00%(objectname:short)%00%(creatordate:unix)%00%(taggername)%00%(taggeremail:trim)%00%(contents)%00";
/// The suffix that denotes that a string contains the number of insertions in a revision.
pub(crate) const DIFF_INSERTIONS: &str = "(+)";
/// The suffix that denotes that a string contains the number of deletions in a revision.
pub(crate) const DIFF_DELETIONS: &str = "(-)";

pub(crate) fn parse_commit_info(line: &String) -> Option<CommitInfo> {
    let mut segments = line.split('\0');

    Some(CommitInfo {
        id: segments.next()?.to_string(),
        short_hash: segments.next()?.to_string(),
        author_name: segments.next()?.to_string(),
        author_email: segments.next()?.to_string(),
        timestamp: u32::from_str(segments.next()?).ok()?,
        message: segments
            .next()
            .and_then(|s| (!s.is_empty()).then_some(s.to_string())),
        parents: segments
            .next()?
            .split_whitespace()
            .map(|s| s.to_string())
            .collect(),
        changes: segments
            .next()
            .and_then(|line| parse_diff_summary(&line.trim_ascii().to_string())),
    })
}

pub(crate) fn parse_head_state(lines: &Vec<String>) -> Option<HeadState> {
    let commit = lines.get(0)?.strip_prefix(HEAD_INFO_COMMIT_PREFIX)?;
    let branch = lines.get(1)?.strip_prefix(HEAD_INFO_BRANCH_PREFIX)?;

    match (commit, branch) {
        (HEAD_INFO_INITIAL_COMMIT, HEAD_INFO_DETACHED_BRANCH) => None,
        (commit_id, HEAD_INFO_DETACHED_BRANCH) => Some(HeadState::Detached {
            commit: commit_id.to_string(),
        }),
        (_, branch_name) => Some(HeadState::Branch {
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

pub(crate) fn parse_versioned_file_info(line: &String) -> Option<VersionedFileInfo> {
    let segments: Vec<&str> = line.split_ascii_whitespace().collect();
    let status_str = segments.get(0)?.chars().nth(0)?.to_string();
    let path = segments.last()?.to_string();

    if let Some(changes) = ChangeStatus::from_str(&status_str).ok() {
        Some(VersionedFileInfo {
            path,
            status: VersionedFileStatus::Changed { changes },
        })
    } else if let Some(changes) = MovedStatus::from_str(&status_str).ok() {
        let old_path = segments.get(1)?.to_string();
        Some(VersionedFileInfo {
            path,
            status: VersionedFileStatus::Moved { changes, old_path },
        })
    } else {
        None
    }
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
    let timestamp = u32::from_str(&segments.next()?).ok()?;

    if branch_name.starts_with(BRANCH_PREFIX) {
        let remote_name = segments.next();
        let remote_branch_name = segments.next();

        Some(BranchInfo::Local {
            name: strip_branch_prefix(&branch_name, BRANCH_PREFIX),
            timestamp: timestamp,
            upstream: match (remote_name, remote_branch_name) {
                (Some(remote_name), Some(remote_branch_name)) => Some(Upstream {
                    remote: remote_name,
                    remote_branch: strip_branch_prefix(&remote_branch_name, BRANCH_PREFIX),
                }),
                _ => None,
            },
        })
    } else if branch_name.starts_with(REMOTE_BRANCH_PREFIX) {
        Some(BranchInfo::Remote {
            name: strip_branch_prefix(&branch_name, REMOTE_BRANCH_PREFIX),
            timestamp: timestamp,
        })
    } else {
        None
    }
}

pub(crate) fn parse_branch_divergence(line: &String) -> Option<BranchDivergence> {
    let mut divergence = line.split_ascii_whitespace().map(String::from);
    let ahead = u32::from_str(&divergence.next()?).ok()?;
    let behind = u32::from_str(&divergence.next()?).ok()?;

    Some(BranchDivergence { ahead, behind })
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

pub(crate) fn parse_diff_summary(line: &String) -> Option<DiffSummary> {
    let files_count;
    let mut insertions = 0;
    let mut deletions = 0;

    let mut sections = line.split(',');

    let files_segment = sections
        .next()?
        .trim_ascii()
        .split_ascii_whitespace()
        .next()?;
    files_count = u32::from_str(files_segment).ok()?;

    let mut parse_section = |section: &str| -> Option<()> {
        let section = section
            .trim_ascii()
            .split_ascii_whitespace()
            .collect::<Vec<_>>();
        if let (Some(section_number), Some(section_type)) = (section.get(0), section.get(1)) {
            if (*section_type).ends_with(DIFF_INSERTIONS) {
                insertions = u32::from_str(section_number).ok().unwrap_or(0);
            } else if (*section_type).ends_with(DIFF_DELETIONS) {
                deletions = u32::from_str(section_number).ok().unwrap_or(0);
            }
        }

        Some(())
    };

    let first_section = sections.next()?;
    parse_section(first_section)?;
    let second_section = sections.next();
    if let Some(second_section) = second_section {
        parse_section(second_section)?;
    }

    Some(DiffSummary {
        files_count,
        insertions,
        deletions,
    })
}

pub(crate) fn parse_stash_info(lines: &Vec<String>) -> Option<StashInfo> {
    let hashes_line = lines.get(0)?;
    let id = lines.get(1)?.to_string();
    let timestamp_line = lines.get(2)?;
    let creation_line = lines.get(3)?;
    let diff_line = lines.get(4);

    let stash_number = id
        .strip_prefix(STASH_NAME_PREFIX)?
        .strip_suffix('}')?
        .to_string();
    let timestamp = u32::from_str(timestamp_line).ok()?;
    let (creation_details, message) = creation_line.split_once(": ")?;
    let message = if creation_details.starts_with(STASH_INFO_QUICK) {
        None
    } else {
        Some(message.to_string())
    };

    let created_on = if creation_details.ends_with(STASH_INFO_DETACHED) {
        hashes_line.split_ascii_whitespace().next()?
    } else {
        creation_details.split_ascii_whitespace().last()?
    }
    .to_string();

    Some(StashInfo {
        id,
        stash_number,
        message,
        timestamp,
        created_on,
        changes: diff_line.and_then(parse_diff_summary),
    })
}

pub(crate) fn parse_tag_info(segments: &Vec<String>) -> Option<TagInfo> {
    let mut segments = segments.iter();

    let name = segments.next()?.to_string();
    let reference_1 = segments.next()?.to_string();
    let reference_2 = segments.next()?.to_string();
    let reference = if !reference_1.is_empty() {
        reference_1
    } else {
        reference_2
    };
    let timestamp = u32::from_str(segments.next()?).ok()?;
    let author_name = segments
        .next()
        .and_then(|s| (!s.is_empty()).then_some(s.to_string()));
    let author_email = segments
        .next()
        .and_then(|s| (!s.is_empty()).then_some(s.to_string()));
    let message = segments
        .next()
        .and_then(|s| (!s.is_empty()).then_some(s.to_string()));

    Some(TagInfo {
        name,
        reference,
        timestamp,
        author_name,
        author_email,
        message,
    })
}

pub(crate) fn read_stream(r: &mut impl Read) -> Option<String> {
    let mut raw = Vec::new();
    r.read_to_end(&mut raw).ok()?;
    let trimmed = String::from_utf8_lossy(&raw).trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}
