use std::fmt::Debug;

use imara_diff::{Algorithm, Diff, Hunk, InternedInput};
use models::{DiffLine, DiffMode};
use regex::Regex;
use std::sync::LazyLock;

static SPLIT_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new(r#"\n|\r\n|\s+|\S+"#).unwrap());

/// Checks if a string is a newline (either `\n` or `\r\n`).
fn is_newline(s: &str) -> bool {
    s == "\n" || s == "\r\n"
}

/// Base computation of a line-based diff for the whole file.
fn get_file_diff<'a>(before: &'a str, after: &'a str) -> (Diff, InternedInput<&'a str>) {
    let input = InternedInput::new(before, after);
    let mut diff = Diff::compute(Algorithm::Histogram, &input);
    diff.postprocess_lines(&input);

    (diff, input)
}

/// Computation of a word-based diff for a specific hunk.
fn get_hunk_diff<'a>(hunk_before: &'a str, hunk_after: &'a str) -> (Diff, InternedInput<&'a str>) {
    let mut hunk_input = InternedInput::default();

    let words_before = SPLIT_REGEX.find_iter(hunk_before).map(|word| word.as_str());
    hunk_input.update_before(words_before);
    let words_after = SPLIT_REGEX.find_iter(&hunk_after).map(|word| word.as_str());
    hunk_input.update_after(words_after);

    let mut hunk_diff = Diff::compute(Algorithm::Histogram, &hunk_input);
    hunk_diff.postprocess_no_heuristic(&hunk_input);

    (hunk_diff, hunk_input)
}

/// Recovers the contents contained in a hunk from the full file diff.
fn get_hunk_contents(hunk: &Hunk, file_input: &InternedInput<&str>) -> (String, String) {
    let hunk_before = file_input.before[hunk.before.start as usize..hunk.before.end as usize]
        .iter()
        .map(|token| file_input.interner[*token])
        .collect::<String>();

    let hunk_after = file_input.after[hunk.after.start as usize..hunk.after.end as usize]
        .iter()
        .map(|token| file_input.interner[*token])
        .collect::<String>();

    (hunk_before, hunk_after)
}

/// Adds a range of unchanged context lines to the result.
fn add_context_lines<T, U>(from: T, to: U, input: &InternedInput<&str>, lines: &mut Vec<DiffLine>)
where
    T: TryInto<usize>,
    T::Error: Debug,
    U: TryInto<usize>,
    U::Error: Debug,
{
    for &token in &input.before[from.try_into().unwrap()..to.try_into().unwrap()] {
        let line = input.interner[token];
        lines.push(DiffLine::Unchanged(vec![format!(" {line}")]));
    }
}

/// Adds the contents of the buffer as a new line and clears it.
fn flush_buffer(line_buffer: &mut Vec<String>, lines: &mut Vec<DiffLine>, line_mode: &DiffMode) {
    let line_constructor = match line_mode {
        DiffMode::Unchanged => DiffLine::Unchanged,
        DiffMode::Added => DiffLine::Added,
        DiffMode::Removed => DiffLine::Removed,
    };

    if !line_buffer.is_empty() {
        lines.push(line_constructor(std::mem::take(line_buffer)));
    }
}

/// Processes a range in one side of the hunk according to the given modes.
fn process_hunk_segments<T, U>(
    from: T,
    to: U,
    hunk_input: &InternedInput<&str>,
    line_buffer: &mut Vec<String>,
    lines: &mut Vec<DiffLine>,
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
            flush_buffer(line_buffer, lines, &line_mode);
        }
    }
}

/// Processes a side of the hunk according to the given mode.
fn process_hunk(
    hunk_diff: &Diff,
    hunk_input: &InternedInput<&str>,
    line_buffer: &mut Vec<String>,
    lines: &mut Vec<DiffLine>,
    current_pos: &mut u32,
    diff_mode: &DiffMode,
) {
    hunk_diff.hunks().for_each(|section_hunk| {
        let stream = match diff_mode {
            DiffMode::Unchanged => &section_hunk.before,
            DiffMode::Added => &section_hunk.after,
            DiffMode::Removed => &section_hunk.before,
        };

        process_hunk_segments(
            *current_pos,
            stream.start,
            &hunk_input,
            line_buffer,
            lines,
            diff_mode,
            &DiffMode::Unchanged,
        );

        process_hunk_segments(
            stream.start,
            stream.end,
            &hunk_input,
            line_buffer,
            lines,
            diff_mode,
            diff_mode,
        );

        *current_pos = stream.end;
    });

    let stream = match diff_mode {
        DiffMode::Unchanged => &hunk_input.before,
        DiffMode::Added => &hunk_input.after,
        DiffMode::Removed => &hunk_input.before,
    };

    process_hunk_segments(
        *current_pos,
        stream.len(),
        &hunk_input,
        line_buffer,
        lines,
        diff_mode,
        &DiffMode::Unchanged,
    );

    if !line_buffer.is_empty() {
        flush_buffer(line_buffer, lines, diff_mode);
    }
}

pub fn compute_diff(before: &str, after: &str) -> Vec<DiffLine> {
    let (file_diff, file_input) = get_file_diff(before, after);
    let mut res = Vec::new();

    let mut current_line = 0;

    file_diff.hunks().for_each(|hunk| {
        add_context_lines(current_line, hunk.before.start, &file_input, &mut res);

        let (hunk_before, hunk_after) = get_hunk_contents(&hunk, &file_input);
        let (hunk_diff, hunk_input) = get_hunk_diff(&hunk_before, &hunk_after);
        let mut line_buffer = Vec::new();

        let mut current_pos = 0;

        process_hunk(
            &hunk_diff,
            &hunk_input,
            &mut line_buffer,
            &mut res,
            &mut current_pos,
            &DiffMode::Removed,
        );

        current_pos = 0;

        process_hunk(
            &hunk_diff,
            &hunk_input,
            &mut line_buffer,
            &mut res,
            &mut current_pos,
            &DiffMode::Added,
        );

        current_line = hunk.before.end;
    });

    add_context_lines(current_line, file_input.before.len(), &file_input, &mut res);

    res
}
