use imara_diff::{Algorithm, Diff, Hunk, InternedInput};
use regex::Regex;
use std::{fmt::Debug, sync::LazyLock};

use models::{DiffLine, DiffMode};

static SPLIT_REGEX: LazyLock<Regex> =
    // TODO: better split for code
    LazyLock::new(|| Regex::new(r#"\n|\r\n|\s+|\w+|[^\w\s]+"#).unwrap());

/// Checks if a string is a newline (either `\n` or `\r\n`).
pub fn is_newline(s: &str) -> bool {
    s == "\n" || s == "\r\n"
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

/// Adds a range of unchanged context lines to the result.
pub(crate) fn add_context_lines<T, U>(
    from: T,
    to: U,
    input: &InternedInput<&str>,
    res: &mut Vec<DiffLine>,
) where
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

/// Base computation of a line-based diff for the whole file.
pub(crate) fn get_line_diff<'a>(before: &'a str, after: &'a str) -> (Diff, InternedInput<&'a str>) {
    let input = InternedInput::new(before, after);
    let mut diff = Diff::compute(Algorithm::Histogram, &input);
    diff.postprocess_lines(&input);

    (diff, input)
}

/// Computation of a word-based diff for a specific hunk.
pub(crate) fn get_hunk_word_diff<'a>(
    hunk_before: &'a str,
    hunk_after: &'a str,
) -> (Diff, InternedInput<&'a str>) {
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
pub(crate) fn get_hunk_contents(hunk: &Hunk, file_input: &InternedInput<&str>) -> (String, String) {
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

/// Processes a side of the hunk according to the given mode.
pub(crate) fn process_hunk(
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
