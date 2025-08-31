use imara_diff::{Algorithm, Diff, InternedInput};
use regex::Regex;

/// Checks if a string is a newline (either `\n` or `\r\n`).
fn is_newline(s: &str) -> bool {
    s == "\n" || s == "\r\n"
}

/// Adds the currently buffered segments as a new line to the result and clears the buffer.
fn flush_buffer(lines: &mut Vec<Vec<String>>, buffer: &mut Vec<String>) {
    lines.push(std::mem::take(buffer));
}

/// Represents the mode of a diff segment.
enum DiffMode {
    Unchanged,
    Added,
    Removed,
}

/// Iterates through a specified range of tokens and appends each segment to the result.
/// Segments are prefixed with a char indicating their type: ' ' for unchanged, '+' for added, and '-' for removed.
fn process_tokens(
    from: u32,
    to: u32,
    input: &InternedInput<&str>,
    lines: &mut Vec<Vec<String>>,
    buffer: &mut Vec<String>,
    mode: DiffMode,
) {
    let stream = match mode {
        DiffMode::Unchanged => &input.before,
        DiffMode::Added => &input.after,
        DiffMode::Removed => &input.before,
    };

    let mode = match mode {
        DiffMode::Unchanged => ' ',
        DiffMode::Added => '+',
        DiffMode::Removed => '-',
    };

    for &token in &stream[(from as usize)..(to as usize)] {
        let segment = input.interner[token];
        if is_newline(segment) {
            flush_buffer(lines, buffer);
        } else {
            buffer.push(format!("{mode}{segment}"));
        }
    }
}

/// Computes the diff between two strings and returns a vector of lines,
/// where each line is a vector of segments prefixed with a char indicating their type.
pub fn compute_diff(before: &str, after: &str) -> Vec<Vec<String>> {
    let mut input = InternedInput::default();

    let regex = Regex::new(r#"\n|\r\n|\s+|\S+"#).unwrap();

    input.update_before(regex.find_iter(before).map(|word| word.as_str()));
    input.update_after(regex.find_iter(after).map(|word| word.as_str()));

    let mut diff = Diff::compute(Algorithm::Histogram, &input);
    diff.postprocess_no_heuristic(&input);

    let mut current_pos = 0;
    let mut lines = Vec::new();
    let mut buffer = Vec::new();

    // https://github.com/pascalkuthe/imara-diff/blob/055f8e39efa52cf20ba1632b1f3437b6e0eb49cf/src/unified_diff.rs#L108
    diff.hunks().for_each(|hunk| {
        process_tokens(
            current_pos,
            hunk.before.start,
            &input,
            &mut lines,
            &mut buffer,
            DiffMode::Unchanged,
        );

        process_tokens(
            hunk.before.start,
            hunk.before.end,
            &input,
            &mut lines,
            &mut buffer,
            DiffMode::Removed,
        );

        process_tokens(
            hunk.after.start,
            hunk.after.end,
            &input,
            &mut lines,
            &mut buffer,
            DiffMode::Added,
        );

        current_pos = hunk.before.end;
    });

    process_tokens(
        current_pos,
        input.before.len() as u32,
        &input,
        &mut lines,
        &mut buffer,
        DiffMode::Unchanged,
    );

    if !buffer.is_empty() {
        flush_buffer(&mut lines, &mut buffer);
    }

    lines
}
