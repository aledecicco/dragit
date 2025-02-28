use tauri::{AppHandle, Emitter, Manager, State};

use models::{
    AppError, AppEvent, AppState, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo,
    GitError, HeadInfo, HistoryItem, SafeHandler,
};

fn with_handler<T>(
    state: &State<AppState>,
    fun: &dyn Fn(&SafeHandler) -> Result<T, GitError>,
) -> Result<T, AppError> {
    let handler = state.git_handler.lock();
    fun(&handler).map_err(AppError::from)
}

/// Opens a folder that contains/will contain a git repository.
#[tauri::command]
pub async fn open_folder(app_handle: AppHandle, path: &str) -> Result<(), AppError> {
    let state = app_handle.state::<AppState>();

    // Unwatch old repository
    // It's expected to fail if the previous watcher wasn't properly set-up
    let _ = state.repo_watcher.lock().unwatch_repo();

    state.git_handler.lock().open_folder(path)?;

    // Watch repositopry at new path
    state
        .repo_watcher
        .lock()
        .watch_repo(path)
        .map_err(AppError::from)?;

    let _ = app_handle.emit(
        "dir-changed",
        AppEvent::DirChanged {
            path: path.to_string(),
        },
    );

    Ok(())
}

/// Returns the current folder being tracked.
#[tauri::command]
pub async fn get_current_dir(state: State<'_, AppState>) -> Result<Option<String>, AppError> {
    with_handler(&state, &|h| Ok(h.get_path().ok()))
}

/// Initializes the current open folder as a git repository.
#[tauri::command]
pub async fn init_repository(state: State<'_, AppState>) -> Result<(), AppError> {
    with_handler(&state, &|h| h.init_repository())
}

/// Returns whether the current open folder is a git repository.
#[tauri::command]
pub async fn is_repository(state: State<'_, AppState>) -> Result<bool, AppError> {
    with_handler(&state, &|h| Ok(h.is_repository()))
}

/// Returns a list of the current known local and remote branches.
#[tauri::command]
pub async fn get_branches(state: State<'_, AppState>) -> Result<Vec<BranchInfo>, AppError> {
    with_handler(&state, &|h| h.get_branches())
}

/// Switches the current repository to a local branch.
#[tauri::command]
pub async fn checkout_local_branch(
    state: State<'_, AppState>,
    branch: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.checkout_local_branch(branch))
}

/// Updates the references of the given remote.
#[tauri::command]
pub async fn fetch_remote(state: State<'_, AppState>, remote: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.fetch_remote(remote))
}

#[tauri::command]
pub async fn get_commit_history(
    state: State<'_, AppState>,
    branch: &str,
    start_after: u8,
    limit: u8,
) -> Result<Vec<HistoryItem>, AppError> {
    with_handler(&state, &|h| {
        h.get_commit_history(branch, start_after, limit)
    })
}

#[tauri::command]
pub async fn get_commit_info(
    state: State<'_, AppState>,
    reference: &str,
) -> Result<CommitInfo, AppError> {
    with_handler(&state, &|h| h.get_commit_info(reference))
}

#[tauri::command]
pub async fn get_head_info(state: State<'_, AppState>) -> Result<HeadInfo, AppError> {
    with_handler(&state, &|h| h.get_head_info())
}

#[tauri::command]
pub async fn add_to_index(state: State<'_, AppState>, files: Vec<&str>) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_to_index(&files))
}

#[tauri::command]
pub async fn remove_from_index(
    state: State<'_, AppState>,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_index(&files))
}

#[tauri::command]
pub async fn remove_from_tree(
    state: State<'_, AppState>,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_tree(&files))
}

#[tauri::command]
pub async fn commit_index(
    state: State<'_, AppState>,
    message: &str,
    is_amend: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.commit_index(message, is_amend))
}

#[tauri::command]
pub async fn get_common_ancestor(
    state: State<'_, AppState>,
    branch: &str,
    base_branch: &str,
) -> Result<Option<CommonAncestorInfo>, AppError> {
    with_handler(&state, &|h| h.get_common_ancestor(branch, base_branch))
}

#[tauri::command]
pub async fn get_branch_divergence(
    state: State<'_, AppState>,
    branch: &str,
    base_branch: &str,
) -> Result<BranchDivergence, AppError> {
    with_handler(&state, &|h| h.get_branch_divergence(branch, base_branch))
}

#[tauri::command]
pub async fn push_branch(
    state: State<'_, AppState>,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_force: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.push_branch(branch, remote, remote_branch, is_force)
    })
}

#[tauri::command]
pub async fn pull_branch(
    state: State<'_, AppState>,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_rebase: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.pull_branch(branch, remote, remote_branch, is_rebase)
    })
}
