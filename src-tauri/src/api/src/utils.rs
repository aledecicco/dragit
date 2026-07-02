use std::{fs, path::Path};

use borsh::BorshSerialize;

use models::{AppError, AppState, GitError, SafeHandler};
use tauri::{ipc::Response, State};

/// Serializes a value using Borsh so it can be sent efficiently over IPC.
pub(crate) fn serialize_response<T: BorshSerialize>(value: T) -> Result<Response, AppError> {
    let mut buffer: Vec<u8> = Vec::new();
    value
        .serialize(&mut buffer)
        .map_err(|_| AppError::SerializationFailed)?;

    Ok(Response::new(buffer))
}

/// Utility to facilitate getting the git handler from the app state.
pub(crate) fn with_handler<T>(
    state: &State<AppState>,
    fun: &dyn Fn(&SafeHandler) -> Result<T, GitError>,
) -> Result<T, AppError> {
    fun(&state.git_handler).map_err(AppError::from)
}

/// Reads the contents of a file from disk, given the repository path and the relative file path.
pub(crate) fn get_disk_file_contents(repo_path: &str, filepath: &str) -> Result<String, AppError> {
    let full_path = Path::new(repo_path).join(filepath);
    let contents = fs::read_to_string(full_path).map_err(|err| AppError::ReadFileFailed {
        path: filepath.to_string(),
        reason: err.to_string(),
    })?;

    Ok(contents)
}

/// Walk up from a path to find the closest ancestor directory containing a `.git` folder.
pub(crate) fn find_git_root(path: &str) -> Option<String> {
    let mut current = Path::new(path).to_path_buf();

    loop {
        if current.join(".git").is_dir() {
            return Some(current.to_str()?.to_string());
        }

        if !current.pop() {
            return None;
        }
    }
}

/// Splits a budget of chars fairly between the files in a diff.
pub(crate) fn budget_diff(diff: &str, budget: usize) -> String {
    let mut sections: Vec<String> = Vec::new();
    for line in diff.lines() {
        match sections.last_mut() {
            Some(section) if !line.starts_with("diff --git ") => {
                section.push_str(line);
                section.push('\n');
            }
            _ => sections.push(format!("{line}\n")),
        }
    }

    sections.sort_by_cached_key(|section| section.chars().count());

    let mut remaining_budget = budget;
    let mut length_cap = budget;
    let mut sections_left = sections.len();

    for section in &sections {
        let share = remaining_budget / sections_left;
        let length = section.chars().count();

        if length > share {
            length_cap = share;
            break;
        }

        remaining_budget -= length;
        sections_left -= 1;
    }

    sections
        .into_iter()
        .map(|section| {
            if section.chars().count() > length_cap {
                format!("{}[diff truncated]\n", &section[..length_cap - 1])
            } else {
                section
            }
        })
        .collect()
}
