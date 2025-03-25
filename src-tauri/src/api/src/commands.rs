use std::path::Path;

use settings::{
    add_recent_folder, get_recent_folders, load_settings, remove_recent_folder, save_settings,
};
use tauri::{AppHandle, Emitter, Manager, State};

use models::{
    AppError, AppEvent, AppState, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo,
    CurrentDirInfo, GitError, GitHandler, HeadInfo, HistoryItem, SafeHandler, Settings, EVENT_ID,
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
pub async fn open_folder(app_handle: AppHandle, new_path: &str) -> Result<(), AppError> {
    let state: State<'_, AppState> = app_handle.state::<AppState>();

    // Unwatch old repository
    state.repo_watcher.lock().unwatch_repository()?;

    // Watch repository at new path
    state
        .repo_watcher
        .lock()
        .watch_repository(new_path)
        .map_err(AppError::from)?;

    // Not worth crashing the app if this fails
    let _ = add_recent_folder(&app_handle, new_path);
    let _ = app_handle.emit(EVENT_ID, AppEvent::DirChanged);

    Ok(())
}

/// Returns the list of recently opened folders.
#[tauri::command]
pub async fn get_recently_opened(app_handle: AppHandle) -> Result<Vec<String>, AppError> {
    Ok(get_recent_folders(&app_handle))
}

/// Removes a folder from the list of recently opened folders.
#[tauri::command]
pub async fn remove_from_recent(app_handle: AppHandle, recent_path: &str) -> Result<(), AppError> {
    remove_recent_folder(&app_handle, recent_path).or(Err(AppError::RemoveFromRecentFailed {
        path: recent_path.to_string(),
    }))
}

/// Returns the stored user settings.
#[tauri::command]
pub async fn get_settings(app_handle: AppHandle) -> Result<Settings, AppError> {
    Ok(load_settings(&app_handle))
}

/// Saves new user settings.
#[tauri::command]
pub async fn set_settings(app_handle: AppHandle, settings: Settings) -> Result<(), AppError> {
    save_settings(&app_handle, &settings).or(Err(AppError::SaveSettingsFailed {}))
}

/// Returns information about the current folder being tracked.
#[tauri::command]
pub async fn get_current_dir(
    state: State<'_, AppState>,
) -> Result<Option<CurrentDirInfo>, AppError> {
    with_handler(&state, &|h| {
        Ok(state
            .repo_watcher
            .lock()
            .get_path()
            .ok()
            .map(|path| CurrentDirInfo {
                path: path.to_string(),
                is_repository: h.is_repository(&path),
                exists: Path::new(&path).exists(),
            }))
    })
}

/// Initializes the current open folder as a git repository.
#[tauri::command]
pub async fn init_repository(state: State<'_, AppState>, path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h: &Box<dyn GitHandler + Send + Sync>| {
        h.init_repository(path)
    })
}

/// Returns a list of the current known local and remote branches.
#[tauri::command]
pub async fn get_branches(
    state: State<'_, AppState>,
    path: &str,
) -> Result<Vec<BranchInfo>, AppError> {
    with_handler(&state, &|h| h.get_branches(path))
}

/// Switches the current repository to a local branch.
#[tauri::command]
pub async fn checkout_local_branch(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.checkout_local_branch(path, branch))
}

/// Updates the references of the given remote.
#[tauri::command]
pub async fn fetch_remote(
    state: State<'_, AppState>,
    path: &str,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.fetch_remote(path, remote))
}

#[tauri::command]
pub async fn get_commit_history(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
    start_after: u8,
    limit: u8,
) -> Result<Vec<HistoryItem>, AppError> {
    with_handler(&state, &|h| {
        h.get_commit_history(path, branch, start_after, limit)
    })
}

#[tauri::command]
pub async fn get_commit_info(
    state: State<'_, AppState>,
    path: &str,
    reference: &str,
) -> Result<CommitInfo, AppError> {
    with_handler(&state, &|h| h.get_commit_info(path, reference))
}

#[tauri::command]
pub async fn get_head_info(state: State<'_, AppState>, path: &str) -> Result<HeadInfo, AppError> {
    with_handler(&state, &|h| h.get_head_info(path))
}

#[tauri::command]
pub async fn add_to_index(
    state: State<'_, AppState>,
    path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_to_index(path, &files))
}

#[tauri::command]
pub async fn remove_from_index(
    state: State<'_, AppState>,
    path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_index(path, &files))
}

#[tauri::command]
pub async fn remove_from_tree(
    state: State<'_, AppState>,
    path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_tree(path, &files))
}

#[tauri::command]
pub async fn commit_index(
    state: State<'_, AppState>,
    path: &str,
    message: &str,
    is_amend: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.commit_index(path, message, is_amend))
}

#[tauri::command]
pub async fn get_common_ancestor(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
    base_branch: &str,
) -> Result<Option<CommonAncestorInfo>, AppError> {
    with_handler(&state, &|h| {
        h.get_common_ancestor(path, branch, base_branch)
    })
}

#[tauri::command]
pub async fn get_branch_divergence(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
    base_branch: &str,
) -> Result<BranchDivergence, AppError> {
    with_handler(&state, &|h| {
        h.get_branch_divergence(path, branch, base_branch)
    })
}

#[tauri::command]
pub async fn push_branch(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_force: bool,
    set_upstream: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.push_branch(path, branch, remote, remote_branch, is_force, set_upstream)
    })
}

#[tauri::command]
pub async fn pull_branch(
    state: State<'_, AppState>,
    path: &str,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_rebase: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.pull_branch(path, branch, remote, remote_branch, is_rebase)
    })
}
