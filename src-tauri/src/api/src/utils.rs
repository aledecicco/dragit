use borsh::BorshSerialize;
use tauri::{ipc::Response, State};

use models::{AppError, AppState, GitError, SafeHandler};

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
