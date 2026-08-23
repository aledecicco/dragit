mod utils;
use utils::*;

use models::{
    ChangeStatus, CleanFileInfo, ConflictLine, ConflictMode, DiffLine, DiffMode, DiffScope,
    DiffSource, MergeDiffStage, MergeStatus, StagedFileStatus, VersionedFileStatus,
};

pub fn compute_diff(before: &str, after: &str) -> Vec<DiffLine> {
    let (file_diff, file_input) = get_line_diff(before, after);
    let mut res = Vec::new();

    let mut current_line = 0;

    file_diff.hunks().for_each(|hunk| {
        add_context_lines(current_line, hunk.before.start, &file_input, &mut res);

        let (hunk_before, hunk_after) = get_hunk_contents(&hunk, &file_input);
        let (hunk_diff, hunk_input) = get_hunk_word_diff(&hunk_before, &hunk_after);
        let mut line_buffer = Vec::new();

        process_hunk(
            &hunk_diff,
            &hunk_input,
            &mut line_buffer,
            &mut res,
            &DiffMode::Removed,
        );

        process_hunk(
            &hunk_diff,
            &hunk_input,
            &mut line_buffer,
            &mut res,
            &DiffMode::Added,
        );

        current_line = hunk.before.end;
    });

    add_context_lines(current_line, file_input.before.len(), &file_input, &mut res);

    res
}

pub fn get_diff_sources(scope: DiffScope) -> (DiffSource, DiffSource) {
    match &scope {
        DiffScope::Versioned {
            file,
            reference,
            against,
        } => (
            match &file.status {
                VersionedFileStatus::Moved {
                    changes: _,
                    old_path,
                } => DiffSource::GitReference(
                    against.clone().unwrap_or(format!("{reference}^1")),
                    old_path.to_string(),
                ),
                VersionedFileStatus::Changed {
                    changes: ChangeStatus::Added,
                } => DiffSource::Empty,
                _ => DiffSource::GitReference(
                    against.clone().unwrap_or(format!("{reference}^1")),
                    file.path.to_string(),
                ),
            },
            match file.status {
                VersionedFileStatus::Changed {
                    changes: ChangeStatus::Deleted,
                } => DiffSource::Empty,
                VersionedFileStatus::Changed {
                    changes: ChangeStatus::Added,
                } => DiffSource::GitReferenceWithFallback(
                    reference.to_string(),
                    format!("{reference}^3"),
                    file.path.to_string(),
                ),
                _ => DiffSource::GitReference(reference.to_string(), file.path.to_string()),
            },
        ),

        DiffScope::Worktree { file } => match file {
            CleanFileInfo::Staged(file) => (
                match &file.status {
                    StagedFileStatus::Moved {
                        changes: _,
                        old_path,
                    } => DiffSource::GitReference("HEAD".to_string(), old_path.to_string()),
                    StagedFileStatus::Changed {
                        changes: ChangeStatus::Added,
                    } => DiffSource::Empty,
                    _ => DiffSource::GitReference("HEAD".to_string(), file.path.to_string()),
                },
                match file.status {
                    StagedFileStatus::Changed {
                        changes: ChangeStatus::Deleted,
                    } => DiffSource::Empty,
                    _ => DiffSource::GitReference(":0".to_string(), file.path.to_string()),
                },
            ),

            CleanFileInfo::Unstaged(file) => (
                match file.status {
                    ChangeStatus::Added => DiffSource::Empty,
                    _ => DiffSource::GitReference(":0".to_string(), file.path.to_string()),
                },
                match file.status {
                    ChangeStatus::Deleted => DiffSource::Empty,
                    _ => DiffSource::DiskFile(file.path.to_string()),
                },
            ),

            CleanFileInfo::Untracked(file) => (
                DiffSource::Empty,
                DiffSource::DiskFile(file.path.to_string()),
            ),
        },

        DiffScope::Unmerged { file, stage } => {
            let base_exists = matches!(
                file.status,
                MergeStatus::BothDeleted
                    | MergeStatus::BothModified
                    | MergeStatus::DeletedByThem
                    | MergeStatus::DeletedByUs
            );

            let ours_exists = matches!(
                file.status,
                MergeStatus::AddedByUs
                    | MergeStatus::BothAdded
                    | MergeStatus::BothModified
                    | MergeStatus::DeletedByThem
            );

            let theirs_exists = matches!(
                file.status,
                MergeStatus::AddedByThem
                    | MergeStatus::BothAdded
                    | MergeStatus::BothModified
                    | MergeStatus::DeletedByUs
            );

            let base = if base_exists {
                DiffSource::GitReference(":1".to_string(), file.path.to_string())
            } else {
                DiffSource::Empty
            };

            let target = match stage {
                MergeDiffStage::Ours => match file.status {
                    MergeStatus::AddedByUs => DiffSource::GitReferenceWithFallback(
                        "HEAD".to_string(),
                        ":2".to_string(),
                        file.path.to_string(),
                    ),
                    _ if ours_exists => {
                        DiffSource::GitReference(":2".to_string(), file.path.to_string())
                    }
                    _ => DiffSource::Empty,
                },

                MergeDiffStage::Theirs => match file.status {
                    MergeStatus::AddedByThem => DiffSource::GitReferenceWithFallback(
                        "MERGE_HEAD".to_string(),
                        ":3".to_string(),
                        file.path.to_string(),
                    ),
                    _ if theirs_exists => {
                        DiffSource::GitReference(":3".to_string(), file.path.to_string())
                    }
                    _ => DiffSource::Empty,
                },
            };

            (base, target)
        }
    }
}

/// Keeps the segments of the lines one side of a conflict has.
pub fn get_side_segments(base_content: &str, side_content: &str) -> Vec<Vec<String>> {
    compute_diff(base_content, side_content)
        .into_iter()
        .filter_map(|line| match line {
            DiffLine::Removed(_) => None,
            DiffLine::Added(segments) | DiffLine::Unchanged(segments) => Some(segments),
        })
        .collect()
}

/// Whether a line delimits a conflict section.
fn is_conflict_marker(line: &str, marker: char) -> bool {
    let width = line.chars().take_while(|c| *c == marker).count();

    width >= 7 && matches!(line[width..].chars().next(), None | Some(' '))
}

/// Splits a conflicted file into its lines, attributing each one to a side and
/// giving it the word-diff segments of that side against the base.
pub fn compute_conflicts(
    content: &str,
    status: &MergeStatus,
    ours_segments: Vec<Vec<String>>,
    theirs_segments: Vec<Vec<String>>,
) -> Vec<ConflictLine> {
    let mut ours_segments = ours_segments.into_iter();
    let mut theirs_segments = theirs_segments.into_iter();

    // Modify/delete conflicts leave one side's content whole, with nothing marking
    // who it belongs to, so the file's status has to answer for it instead.
    let is_marked = content.lines().any(|line| is_conflict_marker(line, '<'));

    let mut current_section = ConflictMode::Unchanged;

    content
        .lines()
        .filter_map(|line| {
            // TODO: Handle cases where conflict markers appear in the actual file content
            if is_conflict_marker(line, '<') {
                current_section = ConflictMode::Ours;
                return None;
            } else if is_conflict_marker(line, '=') {
                current_section = ConflictMode::Theirs;
                return None;
            } else if is_conflict_marker(line, '|') {
                current_section = ConflictMode::Common;
                return None;
            } else if is_conflict_marker(line, '>') {
                current_section = ConflictMode::Unchanged;
                return None;
            }

            if let ConflictMode::Common = current_section {
                // Skip common ancestor lines in diff3 or zdiff3 merge styles.
                return None;
            }

            let line_content = line.to_string() + "\n";

            // Inside a marked section the markers say which side a line came from.
            // Outside, the line is unchanged and belongs to both.
            let side = match current_section {
                ConflictMode::Ours => ConflictMode::Ours,
                ConflictMode::Theirs => ConflictMode::Theirs,
                _ if is_marked => ConflictMode::Unchanged,
                _ => match status {
                    MergeStatus::AddedByUs | MergeStatus::DeletedByThem => ConflictMode::Ours,
                    MergeStatus::AddedByThem | MergeStatus::DeletedByUs => ConflictMode::Theirs,
                    MergeStatus::BothModified
                    | MergeStatus::BothAdded
                    | MergeStatus::BothDeleted => ConflictMode::Unchanged,
                },
            };

            let unsegmented = vec![format!(" {line_content}")];
            Some(match side {
                ConflictMode::Ours => {
                    ConflictLine::Ours(ours_segments.next().unwrap_or(unsegmented))
                }
                ConflictMode::Theirs => {
                    ConflictLine::Theirs(theirs_segments.next().unwrap_or(unsegmented))
                }
                _ => {
                    // Lines the merge left alone are in both sides, so we pop from both.
                    ours_segments.next();
                    theirs_segments.next();
                    ConflictLine::Unchanged(unsegmented)
                }
            })
        })
        .collect()
}
