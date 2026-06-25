mod utils;
use utils::*;

use models::{
    ChangeStatus, CleanFileInfo, DiffLine, DiffMode, DiffScope, DiffSource, MergeDiffStage,
    MergeStatus, StagedFileStatus, VersionedFileStatus,
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
                // TODO: not working for untracked files added to stashes
                // VersionedFileStatus::Changed {
                //     changes: ChangeStatus::Added,
                // } => DiffSource::GitReference(format!("{snapshot_id}^3"), file.path.to_string()),
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
                MergeDiffStage::Ours => {
                    if ours_exists {
                        DiffSource::GitReference(":2".to_string(), file.path.to_string())
                    } else {
                        DiffSource::Empty
                    }
                }

                MergeDiffStage::Theirs => {
                    if theirs_exists {
                        DiffSource::GitReference(":3".to_string(), file.path.to_string())
                    } else {
                        DiffSource::Empty
                    }
                }
            };

            (base, target)
        }
    }
}
