use borsh::BorshSerialize;
use tauri::{ipc::Response, State};

use models::{AppError, AppState, GitError, SafeHandler};

pub(crate) fn serialize_response<T: BorshSerialize>(value: T) -> Result<Response, AppError> {
    let mut buffer: Vec<u8> = Vec::new();
    value
        .serialize(&mut buffer)
        .map_err(|_| AppError::SerializationFailed)?;

    Ok(Response::new(buffer))
}

pub(crate) fn with_handler<T>(
    state: &State<AppState>,
    fun: &dyn Fn(&SafeHandler) -> Result<T, GitError>,
) -> Result<T, AppError> {
    fun(&state.git_handler).map_err(AppError::from)
}
