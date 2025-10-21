use std::path::Path;
use tauri::{
    ipc::{Channel, Response},
    AppHandle, Emitter, Manager, State,
};

use crate::{serialize_response, utils::get_disk_file_contents, with_handler};
use diffs::{compute_diff, get_diff_sources};
use models::{
    AppError, AppEvent, AppMessage, AppState, ConflictLine, ConflictMode, CurrentDirInfo,
    DiffScope, DiffSource, FileTypesFilter, GitHandler, RepoWatcherError, Settings, EVENT_ID,
};
use settings::{
    add_recent_folder, get_recent_folders, load_settings, remove_recent_folder, save_settings,
    set_last_opened,
};

/// Opens a folder that contains/will contain a git repository.
#[tauri::command]
pub async fn open_folder(app_handle: AppHandle, new_path: &str) -> Result<(), AppError> {
    let state: State<'_, AppState> = app_handle.state::<AppState>();

    // Unwatch old repository, if any
    match state.repo_watcher.lock().unwatch_repository() {
        Err(RepoWatcherError::RepositoryNotWatched {}) => {}
        res => res?,
    };

    // Watch repository at new path
    state
        .repo_watcher
        .lock()
        .watch_repository(new_path)
        .map_err(AppError::from)?;

    // Not worth crashing the app if this fails
    let _ = add_recent_folder(&app_handle, new_path);
    let _ = set_last_opened(&app_handle, new_path);
    let _ = app_handle.emit(EVENT_ID, AppEvent::DirChanged);

    Ok(())
}

/// Returns the list of recently opened folders.
#[tauri::command]
pub async fn get_recently_opened(app_handle: AppHandle) -> Result<Response, AppError> {
    Ok(get_recent_folders(&app_handle)).and_then(serialize_response)
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
pub async fn get_current_dir(state: State<'_, AppState>) -> Result<Response, AppError> {
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
    .and_then(serialize_response)
}

/// Initializes the current open folder as a git repository.
#[tauri::command]
pub async fn init_repository(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h: &Box<dyn GitHandler + Send + Sync>| {
        h.init_repository(repo_path)
    })
}

/// Returns a list of the current known local and remote branches.
#[tauri::command]
pub async fn get_branches(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_branches(&channel, repo_path)).and_then(serialize_response)
}

/// Switches the current repository to a different branch.
#[tauri::command]
pub async fn checkout(
    state: State<'_, AppState>,
    repo_path: &str,
    reference: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.checkout(repo_path, reference))
}

#[tauri::command]
pub async fn get_commit_history_page(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    reference: &str,
    start_after: usize,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_commit_history_page(&channel, repo_path, reference, start_after, limit)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn get_commit_info(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    reference: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_commit_info(&channel, repo_path, reference)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn get_head_info(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_head_info(&channel, repo_path)).and_then(serialize_response)
}

#[tauri::command]
pub async fn get_worktree_files_page(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    filter: FileTypesFilter,
    pathspec: Option<&str>,
    start_after: usize,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_worktree_files_page(&channel, repo_path, &filter, pathspec, start_after, limit)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn get_snapshot_files_page(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    snapshot_id: &str,
    parent: Option<&str>,
    start_after: usize,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_snapshot_files_page(&channel, repo_path, snapshot_id, parent, start_after, limit)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn add_to_index(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_to_index(repo_path, &files))
}

#[tauri::command]
pub async fn remove_from_index(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_index(repo_path, &files))
}

#[tauri::command]
pub async fn remove_from_tree(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_tree(repo_path, &files))
}

#[tauri::command]
pub async fn commit_index(
    state: State<'_, AppState>,
    repo_path: &str,
    message: &str,
    is_amend: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.commit_index(repo_path, message, is_amend))
}

#[tauri::command]
pub async fn get_common_ancestor(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    reference_a: &str,
    reference_b: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_common_ancestor(&channel, repo_path, reference_a, reference_b)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn get_branch_divergence(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    branch: &str,
    base_branch: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_branch_divergence(&channel, repo_path, branch, base_branch)
    })
    .and_then(serialize_response)
}

#[tauri::command]
pub async fn push_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_force: bool,
    set_upstream: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.push_branch(
            repo_path,
            branch,
            remote,
            remote_branch,
            is_force,
            set_upstream,
        )
    })
}

#[tauri::command]
pub async fn pull_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    branch: &str,
    remote: &str,
    remote_branch: &str,
    is_rebase: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.pull_branch(repo_path, branch, remote, remote_branch, is_rebase)
    })
}

#[tauri::command]
pub async fn fast_forward_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    branch: &str,
    remote: &str,
    remote_branch: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.fast_forward_branch(repo_path, branch, remote, remote_branch)
    })
}

#[tauri::command]
pub async fn get_remotes(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_remotes(&channel, repo_path)).and_then(serialize_response)
}

#[tauri::command]
pub async fn fetch_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.fetch_remote(repo_path, remote))
}

#[tauri::command]
pub async fn set_upstream(
    state: State<'_, AppState>,
    repo_path: &str,
    branch: &str,
    remote_ref: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.set_upstream(repo_path, branch, remote_ref))
}

#[tauri::command]
pub async fn add_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    url: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_remote(repo_path, name, url))
}

#[tauri::command]
pub async fn remove_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_remote(repo_path, name))
}

#[tauri::command]
pub async fn rename_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    new_name: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.rename_remote(repo_path, name, new_name))
}

#[tauri::command]
pub async fn change_remote_url(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    new_url: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.change_remote_url(repo_path, name, new_url))
}

#[tauri::command]
pub async fn get_stashes(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_stashes(&channel, repo_path)).and_then(serialize_response)
}

#[tauri::command]
pub async fn stash(
    state: State<'_, AppState>,
    repo_path: &str,
    message: Option<&str>,
    files: Vec<&str>,
    include_untracked: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.stash(repo_path, message, &files, include_untracked)
    })
}

#[tauri::command]
pub async fn apply_stash(
    state: State<'_, AppState>,
    repo_path: &str,
    stash_id: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.apply_stash(repo_path, stash_id))
}

#[tauri::command]
pub async fn discard_stash(
    state: State<'_, AppState>,
    repo_path: &str,
    stash_id: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.discard_stash(repo_path, stash_id))
}

#[tauri::command]
pub async fn get_file_diff(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    scope: DiffScope,
) -> Result<Response, AppError> {
    let (before_source, after_source) = get_diff_sources(scope);

    let before_content = match before_source {
        DiffSource::Empty => "".to_string(),
        DiffSource::DiskFile(filepath) => get_disk_file_contents(repo_path, &filepath)?,
        DiffSource::GitReference(reference, filepath) => with_handler(&state, &|h| {
            h.get_file_contents(&channel, repo_path, &reference, &filepath)
        })?,
    };

    let after_content = match after_source {
        DiffSource::Empty => "".to_string(),
        DiffSource::DiskFile(filepath) => get_disk_file_contents(repo_path, &filepath)?,
        DiffSource::GitReference(reference, filepath) => with_handler(&state, &|h| {
            h.get_file_contents(&channel, repo_path, &reference, &filepath)
        })?,
    };

    let diff = compute_diff(&before_content, &after_content);

    serialize_response(diff)
}

#[tauri::command]
pub async fn get_file_conflicts(repo_path: &str, filepath: &str) -> Result<Response, AppError> {
    let content = get_disk_file_contents(repo_path, filepath)?;

    let mut current_section = ConflictMode::Unchanged;

    let conflicts = content
        .lines()
        .map(|line| {
            // TODO: Handle cases where conflict markers appear in the actual file content
            if line.starts_with("<<<<<<< ") {
                current_section = ConflictMode::Ours;
                return None;
            } else if line.starts_with("=======") {
                current_section = ConflictMode::Theirs;
                return None;
            } else if line.starts_with(">>>>>>> ") {
                current_section = ConflictMode::Unchanged;
                return None;
            }

            let conflict_line = match current_section {
                ConflictMode::Unchanged => ConflictLine::Unchanged(line.to_string()),
                ConflictMode::Ours => ConflictLine::Ours(line.to_string()),
                ConflictMode::Theirs => ConflictLine::Theirs(line.to_string()),
            };

            Some(conflict_line)
        })
        .flatten()
        .collect::<Vec<ConflictLine>>();

    serialize_response(conflicts)
}
