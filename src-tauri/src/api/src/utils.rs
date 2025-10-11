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

/// Reads the contents of a file from disk, given the repository path and the file path.
pub(crate) fn get_disk_file_contents(repo_path: &str, file_path: &str) -> Result<String, AppError> {
    let full_path = Path::new(repo_path).join(file_path);
    let contents = fs::read_to_string(full_path).or(Err(AppError::ReadFileFailed {
        path: file_path.to_string(),
    }))?;

    Ok(contents)
}
