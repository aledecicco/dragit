mod utils;
use utils::*;

use imara_diff::{Diff, InternedInput};
use std::fmt::Debug;

use models::{
    ChangeStatus, DiffLine, DiffMode, DiffScope, DiffSource, StagedFileStatus, VersionedFileStatus,
    WorktreeFileInfo,
};

/// Adds a range of unchanged context lines to the result.
fn add_context_lines<T, U>(from: T, to: U, input: &InternedInput<&str>, res: &mut Vec<DiffLine>)
where
    T: TryInto<usize>,
    T::Error: Debug,
    U: TryInto<usize>,
    U::Error: Debug,
{
    for &token in &input.before[from.try_into().unwrap()..to.try_into().unwrap()] {
        let line = input.interner[token];
        res.push(DiffLine::Unchanged(vec![format!(" {line}")]));
    }
}

/// Adds the contents of the buffer as a new line and clears it.
fn flush_buffer(line_buffer: &mut Vec<String>, res: &mut Vec<DiffLine>, line_mode: &DiffMode) {
    let line_constructor = match line_mode {
        DiffMode::Unchanged => DiffLine::Unchanged,
        DiffMode::Added => DiffLine::Added,
        DiffMode::Removed => DiffLine::Removed,
    };

    if !line_buffer.is_empty() {
        res.push(line_constructor(std::mem::take(line_buffer)));
    }
}

/// Processes a range in one side of the hunk according to the given modes.
fn process_hunk_segments<T, U>(
    from: T,
    to: U,
    hunk_input: &InternedInput<&str>,
    line_buffer: &mut Vec<String>,
    res: &mut Vec<DiffLine>,
    line_mode: &DiffMode,
    segment_mode: &DiffMode,
) where
    T: TryInto<usize>,
    T::Error: Debug,
    U: TryInto<usize>,
    U::Error: Debug,
{
    let stream = match line_mode {
        DiffMode::Unchanged => &hunk_input.before,
        DiffMode::Added => &hunk_input.after,
        DiffMode::Removed => &hunk_input.before,
    };

    let indicator = match segment_mode {
        DiffMode::Unchanged => ' ',
        DiffMode::Added => '+',
        DiffMode::Removed => '-',
    };

    for &token in &stream[from.try_into().unwrap()..to.try_into().unwrap()] {
        let segment = hunk_input.interner[token];
        line_buffer.push(format!("{indicator}{segment}"));
        if is_newline(segment) {
            flush_buffer(line_buffer, res, &line_mode);
        }
    }
}

/// Processes a side of the hunk according to the given mode.
fn process_hunk(
    hunk_diff: &Diff,
    hunk_input: &InternedInput<&str>,
    line_buffer: &mut Vec<String>,
    res: &mut Vec<DiffLine>,
    diff_mode: &DiffMode,
) {
    let mut current_pos = 0;

    hunk_diff.hunks().for_each(|section_hunk| {
        let stream = match diff_mode {
            DiffMode::Unchanged => &section_hunk.before,
            DiffMode::Added => &section_hunk.after,
            DiffMode::Removed => &section_hunk.before,
        };

        process_hunk_segments(
            current_pos,
            stream.start,
            &hunk_input,
            line_buffer,
            res,
            diff_mode,
            &DiffMode::Unchanged,
        );

        process_hunk_segments(
            stream.start,
            stream.end,
            &hunk_input,
            line_buffer,
            res,
            diff_mode,
            diff_mode,
        );

        current_pos = stream.end;
    });

    let stream = match diff_mode {
        DiffMode::Unchanged => &hunk_input.before,
        DiffMode::Added => &hunk_input.after,
        DiffMode::Removed => &hunk_input.before,
    };

    process_hunk_segments(
        current_pos,
        stream.len(),
        &hunk_input,
        line_buffer,
        res,
        diff_mode,
        &DiffMode::Unchanged,
    );

    if !line_buffer.is_empty() {
        flush_buffer(line_buffer, res, diff_mode);
    }
}

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
        DiffScope::Snapshot { snapshot_id, file } => (
            match &file.status {
                VersionedFileStatus::Moved {
                    changes: _,
                    old_path,
                } => DiffSource::GitReference(format!("{snapshot_id}^1"), old_path.to_string()),
                VersionedFileStatus::Changed {
                    changes: ChangeStatus::Added,
                } => DiffSource::Empty,
                _ => DiffSource::GitReference(format!("{snapshot_id}^1"), file.path.to_string()),
            },
            match file.status {
                VersionedFileStatus::Changed {
                    changes: ChangeStatus::Deleted,
                } => DiffSource::Empty,
                _ => DiffSource::GitReference(snapshot_id.to_string(), file.path.to_string()),
            },
        ),

        DiffScope::Worktree { file } => match file {
            WorktreeFileInfo::Staged(file) => (
                match &file.status {
                    StagedFileStatus::Moved {
                        changes: _,
                        old_path,
                    } => DiffSource::GitReference(":HEAD".to_string(), old_path.to_string()),
                    StagedFileStatus::Changed {
                        changes: ChangeStatus::Added,
                    } => DiffSource::Empty,
                    _ => DiffSource::GitReference(":HEAD".to_string(), file.path.to_string()),
                },
                match file.status {
                    StagedFileStatus::Changed {
                        changes: ChangeStatus::Deleted,
                    } => DiffSource::Empty,
                    _ => DiffSource::GitReference(":0".to_string(), file.path.to_string()),
                },
            ),

            WorktreeFileInfo::Unstaged(file) => (
                match file.status {
                    ChangeStatus::Added => DiffSource::Empty,
                    _ => DiffSource::GitReference(":0".to_string(), file.path.to_string()),
                },
                match file.status {
                    ChangeStatus::Deleted => DiffSource::Empty,
                    _ => DiffSource::DiskFile(file.path.to_string()),
                },
            ),

            WorktreeFileInfo::Untracked(file) => (
                DiffSource::Empty,
                DiffSource::DiskFile(file.path.to_string()),
            ),

            WorktreeFileInfo::Unmerged(_) => todo!(),
        },
    }
}
