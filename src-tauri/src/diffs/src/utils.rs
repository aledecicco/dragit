use imara_diff::{Algorithm, Diff, Hunk, InternedInput};
use regex::Regex;
use std::sync::LazyLock;

static SPLIT_REGEX: LazyLock<Regex> =
    // TODO: better split for code
    LazyLock::new(|| Regex::new(r#"\n|\r\n|\s+|\w+|[^\w\s]+"#).unwrap());

/// Checks if a string is a newline (either `\n` or `\r\n`).
pub fn is_newline(s: &str) -> bool {
    s == "\n" || s == "\r\n"
}

/// Base computation of a line-based diff for the whole file.
pub fn get_line_diff<'a>(before: &'a str, after: &'a str) -> (Diff, InternedInput<&'a str>) {
    let input = InternedInput::new(before, after);
    let mut diff = Diff::compute(Algorithm::Histogram, &input);
    diff.postprocess_lines(&input);

    (diff, input)
}

/// Computation of a word-based diff for a specific hunk.
pub fn get_hunk_word_diff<'a>(
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
pub fn get_hunk_contents(hunk: &Hunk, file_input: &InternedInput<&str>) -> (String, String) {
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
