use std::path::Path;
use tauri::{
    ipc::{Channel, Response},
    AppHandle, Emitter, Manager, State,
};

use crate::{
    serialize_response,
    utils::{find_git_root, get_disk_file_contents},
    with_handler,
};
use diffs::{compute_diff, get_diff_sources};
use models::{
    AppError, AppEvent, AppMessage, AppState, ConflictLine, ConflictMode, CurrentDirInfo,
    DiffScope, DiffSource, FileTypesFilter, GitHandler, MergeStatus, PartialRepositoryStorage,
    PartialSettings, RepoWatcherError, ResolutionStrategy, Storage, UnmergedFileInfo, EVENT_ID,
};
use storage::{
    add_recent_folder, get_storage, patch_repository_storage, patch_settings, set_last_opened,
};

/// Opens a folder that contains/will contain a git repository.
#[tauri::command]
pub async fn open_folder(app_handle: AppHandle, new_path: &str) -> Result<(), AppError> {
    let state: State<'_, AppState> = app_handle.state::<AppState>();

    // Unwatch old repository, if any.
    match state.repo_watcher.lock().unwatch_repository() {
        Err(RepoWatcherError::RepositoryNotWatched {}) => {}
        res => res?,
    };

    // If the new path is inside a git repository,use the root of that repository instead.
    let new_path = find_git_root(new_path).unwrap_or(new_path.to_string());

    // Watch repository at new path.
    state
        .repo_watcher
        .lock()
        .watch_repository(&new_path)
        .map_err(AppError::from)?;

    // Not worth crashing the app if this fails.
    let _ = add_recent_folder(&app_handle, &new_path);
    let _ = set_last_opened(&app_handle, &new_path);
    let _ = app_handle.emit(EVENT_ID, AppEvent::DirChanged);

    Ok(())
}

/// Returns the app storage.
#[tauri::command]
pub async fn get_app_storage(app_handle: AppHandle) -> Result<Storage, AppError> {
    Ok(get_storage(&app_handle))
}

/// Saves new user settings.
#[tauri::command]
pub async fn set_settings(
    app_handle: AppHandle,
    settings: PartialSettings,
) -> Result<(), AppError> {
    patch_settings(&app_handle, &settings).map_err(|err| AppError::UpdateStorageFailed {
        reason: err.to_string(),
    })?;

    let _ = app_handle.emit(EVENT_ID, AppEvent::StorageUpdated);

    Ok(())
}

/// Saves new data for a given repository.
#[tauri::command]
pub async fn set_repository_storage(
    app_handle: AppHandle,
    repo_path: &str,
    storage: PartialRepositoryStorage,
) -> Result<(), AppError> {
    patch_repository_storage(&app_handle, repo_path, &storage).map_err(|err| {
        AppError::UpdateStorageFailed {
            reason: err.to_string(),
        }
    })?;

    let _ = app_handle.emit(EVENT_ID, AppEvent::StorageUpdated);

    Ok(())
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
    is_new: bool,
    from_reference: Option<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.checkout(repo_path, reference, is_new, from_reference)
    })
}

/// Creates a new branch pointing to the given reference.
#[tauri::command]
pub async fn create_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    branch_name: &str,
    from_reference: Option<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.create_branch(repo_path, branch_name, from_reference)
    })
}

/// Deletes the given local branches.
#[tauri::command]
pub async fn delete_local_branches(
    state: State<'_, AppState>,
    repo_path: &str,
    branch_names: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.delete_local_branches(repo_path, &branch_names)
    })
}

/// Deletes the given remote branches.
#[tauri::command]
pub async fn delete_remote_branches(
    state: State<'_, AppState>,
    repo_path: &str,
    branch_names: Vec<&str>,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.delete_remote_branches(repo_path, &branch_names, remote)
    })
}

/// Returns a paginated list of commits leading up to the given reference.
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

/// Returns the first commits that match the given search hash.
#[tauri::command]
pub async fn get_matching_commits(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    hash_search: &str,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_matching_commits(&channel, repo_path, hash_search, limit)
    })
    .and_then(serialize_response)
}

/// Returns detailed information about the commit pointed at by the given reference.
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

/// Returns the diff summary  between two arbitrary refs.
#[tauri::command]
pub async fn get_diff_summary(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    reference: &str,
    against: Option<&str>,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_diff_summary(&channel, repo_path, reference, against)
    })
    .and_then(serialize_response)
}

/// Returns the current status of the repository's HEAD.
#[tauri::command]
pub async fn get_head_info(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_head_info(&channel, repo_path)).and_then(serialize_response)
}

/// Returns a paginated list of the files in the working tree.
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

/// Returns a paginated list of the files versioned in the given snapshot.
/// Optionally receives a parent to compare against.
#[tauri::command]
pub async fn get_versioned_files_page(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    reference: &str,
    against: Option<&str>,
    start_after: usize,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_versioned_files_page(&channel, repo_path, reference, against, start_after, limit)
    })
    .and_then(serialize_response)
}

/// Returns (a page of) the list of files in a stash, including untracked files.
#[tauri::command]
pub async fn get_stash_files_page(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
    stash_id: &str,
    start_after: usize,
    limit: usize,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| {
        h.get_stash_files_page(&channel, repo_path, stash_id, start_after, limit)
    })
    .and_then(serialize_response)
}

/// Staged the given files.
#[tauri::command]
pub async fn add_to_index(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_to_index(repo_path, &files))
}

/// Unstages the given files.
#[tauri::command]
pub async fn remove_from_index(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_index(repo_path, &files))
}

/// Removes the given files from the tree.
#[tauri::command]
pub async fn remove_from_tree(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_from_tree(repo_path, &files))
}

/// Removes the given untracked files.
#[tauri::command]
pub async fn clean_files(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.clean_files(repo_path, &files))
}

/// Commits the current index with the given message.
#[tauri::command]
pub async fn commit_index(
    state: State<'_, AppState>,
    repo_path: &str,
    message: &str,
    is_amend: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.commit_index(repo_path, message, is_amend))
}

/// Resets the HEAD to undo the given reference without changing the index or working directory.
#[tauri::command]
pub async fn reset_head(
    state: State<'_, AppState>,
    repo_path: &str,
    reference: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.reset_head(repo_path, reference))
}

/// Restores the status of the given files to the one in the given revision.
#[tauri::command]
pub async fn restore(
    state: State<'_, AppState>,
    repo_path: &str,
    reference: Option<&str>,
    is_staged: bool,
    is_worktree: bool,
    files: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.restore(repo_path, reference, is_staged, is_worktree, &files)
    })
}

/// Returns the commit hash of the latest common ancestor between the two given references.
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

/// Returns the divergence between the two given branches.
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

/// Pushes the current branch to the given remote.
#[tauri::command]
pub async fn push_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    remote: &str,
    remote_branch: &str,
    is_force: bool,
    set_upstream: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.push_branch(repo_path, remote, remote_branch, is_force, set_upstream)
    })
}

/// Pulls the current branch from the given remote.
#[tauri::command]
pub async fn pull_branch(
    state: State<'_, AppState>,
    repo_path: &str,
    remote: &str,
    remote_branch: &str,
    is_rebase: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.pull_branch(repo_path, remote, remote_branch, is_rebase)
    })
}

/// Fast-forwards a branch to match the given remote branch.
/// Can be called without checking-out first.
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

/// Returns the list of currently known remotes.
#[tauri::command]
pub async fn get_remotes(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_remotes(&channel, repo_path)).and_then(serialize_response)
}

/// Fetches the status of the given remote.
#[tauri::command]
pub async fn fetch_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.fetch_remote(repo_path, remote))
}

/// Sets the upstream of a branch to the given remote reference.
#[tauri::command]
pub async fn set_upstream(
    state: State<'_, AppState>,
    repo_path: &str,
    branch: &str,
    remote_ref: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.set_upstream(repo_path, branch, remote_ref))
}

/// Adds a new remote with the given name and URL.
#[tauri::command]
pub async fn add_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    url: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.add_remote(repo_path, name, url))
}

/// Removes the given remote.
#[tauri::command]
pub async fn remove_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.remove_remote(repo_path, name))
}

/// Renames the given remote.
#[tauri::command]
pub async fn rename_remote(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    new_name: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.rename_remote(repo_path, name, new_name))
}

/// Changes the URL of the given remote.
#[tauri::command]
pub async fn change_remote_url(
    state: State<'_, AppState>,
    repo_path: &str,
    name: &str,
    new_url: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.change_remote_url(repo_path, name, new_url))
}

/// Returns the current list of stashes.
#[tauri::command]
pub async fn get_stashes(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_stashes(&channel, repo_path)).and_then(serialize_response)
}

/// Creates a new stash including the given files.
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

/// Pops a stash entry.
#[tauri::command]
pub async fn apply_stash(
    state: State<'_, AppState>,
    repo_path: &str,
    stash_id: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.apply_stash(repo_path, stash_id))
}

/// Discards the given stash entries.
#[tauri::command]
pub async fn discard_stashes(
    state: State<'_, AppState>,
    repo_path: &str,
    stash_ids: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.discard_stashes(repo_path, &stash_ids))
}

/// Returns the current list of tags.
#[tauri::command]
pub async fn get_tags(
    state: State<'_, AppState>,
    channel: Channel<AppMessage>,
    repo_path: &str,
) -> Result<Response, AppError> {
    with_handler(&state, &|h| h.get_tags(&channel, repo_path)).and_then(serialize_response)
}

/// Creates a new tag at the given reference.
#[tauri::command]
pub async fn tag(
    state: State<'_, AppState>,
    repo_path: &str,
    tag_name: &str,
    reference: &str,
    message: Option<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.tag(repo_path, tag_name, reference, message))
}

/// Pushes the given tag to the given remote.
#[tauri::command]
pub async fn push_tag(
    state: State<'_, AppState>,
    repo_path: &str,
    tag: &str,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.push_tag(repo_path, tag, remote))
}

/// Removes a list of local tags.
#[tauri::command]
pub async fn delete_local_tags(
    state: State<'_, AppState>,
    repo_path: &str,
    tag_names: Vec<&str>,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.delete_local_tags(repo_path, &tag_names))
}

/// Removes a list of remote tags.
#[tauri::command]
pub async fn delete_remote_tags(
    state: State<'_, AppState>,
    repo_path: &str,
    tag_names: Vec<&str>,
    remote: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.delete_remote_tags(repo_path, &tag_names, remote)
    })
}

/// Returns the diff of a file between two sources.
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
        DiffSource::GitReference(reference, filepath)
        | DiffSource::GitReferenceWithFallback(reference, _, filepath) => {
            with_handler(&state, &|h| {
                h.get_file_contents(&channel, repo_path, &reference, &filepath)
            })?
        }
    };

    let after_content = match after_source {
        DiffSource::Empty => "".to_string(),
        DiffSource::DiskFile(filepath) => get_disk_file_contents(repo_path, &filepath)?,
        DiffSource::GitReference(reference, filepath) => with_handler(&state, &|h| {
            h.get_file_contents(&channel, repo_path, &reference, &filepath)
        })?,
        DiffSource::GitReferenceWithFallback(reference, fallback, filepath) => {
            with_handler(&state, &|h| {
                h.get_file_contents(&channel, repo_path, &reference, &filepath)
                    .or_else(|_| h.get_file_contents(&channel, repo_path, &fallback, &filepath))
            })?
        }
    };

    let diff = compute_diff(&before_content, &after_content);

    serialize_response(diff)
}

/// Returns the conflict sections of a file with merge conflicts.
#[tauri::command]
pub async fn get_file_conflicts(
    repo_path: &str,
    file: UnmergedFileInfo,
) -> Result<Response, AppError> {
    let content = match file.status {
        MergeStatus::BothDeleted => "".to_string(),
        _ => get_disk_file_contents(repo_path, &file.path)?,
    };

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
            } else if line.starts_with("||||||| ") {
                current_section = ConflictMode::Common;
                return None;
            } else if line.starts_with(">>>>>>> ") {
                current_section = ConflictMode::Unchanged;
                return None;
            }

            if let ConflictMode::Common = current_section {
                // Skip common ancestor lines in diff3 or zdiff3 merge styles.
                return None;
            }

            let line_content = line.to_string() + "\n";
            let constructor = match file.status {
                MergeStatus::AddedByThem => ConflictLine::Theirs,
                MergeStatus::AddedByUs => ConflictLine::Ours,
                MergeStatus::DeletedByThem => ConflictLine::Ours,
                MergeStatus::DeletedByUs => ConflictLine::Theirs,
                MergeStatus::BothModified | MergeStatus::BothAdded => match current_section {
                    ConflictMode::Ours => ConflictLine::Ours,
                    ConflictMode::Theirs => ConflictLine::Theirs,
                    _ => ConflictLine::Unchanged,
                },
                MergeStatus::BothDeleted => ConflictLine::Unchanged,
            };

            Some(constructor(line_content))
        })
        .flatten()
        .collect::<Vec<ConflictLine>>();

    serialize_response(conflicts)
}

/// Solves file conflicts using the given strategy.
#[tauri::command]
pub async fn solve_file_conflicts(
    state: State<'_, AppState>,
    repo_path: &str,
    files: Vec<&str>,
    strategy: ResolutionStrategy,
) -> Result<(), AppError> {
    with_handler(&state, &|h| {
        h.solve_file_conflicts(repo_path, &files, &strategy)
    })
}

/// Aborts the ongoing merge operation.
#[tauri::command]
pub async fn abort_merge(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.abort_merge(repo_path))
}

/// Continues the ongoing merge operation.
#[tauri::command]
pub async fn continue_merge(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.continue_merge(repo_path))
}

/// Aborts the ongoing rebase operation.
#[tauri::command]
pub async fn abort_rebase(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.abort_rebase(repo_path))
}

/// Continues the ongoing rebase operation.
#[tauri::command]
pub async fn continue_rebase(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.continue_rebase(repo_path))
}

/// Aborts the ongoing cherry-pick operation.
#[tauri::command]
pub async fn abort_cherry_pick(
    state: State<'_, AppState>,
    repo_path: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.abort_cherry_pick(repo_path))
}

/// Continues the ongoing cherry-pick operation.
#[tauri::command]
pub async fn continue_cherry_pick(
    state: State<'_, AppState>,
    repo_path: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.continue_cherry_pick(repo_path))
}

/// Aborts the ongoing revert operation.
#[tauri::command]
pub async fn abort_revert(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.abort_revert(repo_path))
}

/// Continues the ongoing revert operation.
#[tauri::command]
pub async fn continue_revert(state: State<'_, AppState>, repo_path: &str) -> Result<(), AppError> {
    with_handler(&state, &|h| h.continue_revert(repo_path))
}

/// Merges the given reference into the current branch.
#[tauri::command]
pub async fn merge(
    state: State<'_, AppState>,
    repo_path: &str,
    reference: &str,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.merge(repo_path, reference))
}

/// Cherry-picks the given references into the current branch.
#[tauri::command]
pub async fn cherry_pick(
    state: State<'_, AppState>,
    repo_path: &str,
    references: Vec<&str>,
    is_merge: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.cherry_pick(repo_path, &references, is_merge))
}

/// Reverts the given commit, creating a new commit with the reverted changes.
#[tauri::command]
pub async fn revert_commit(
    state: State<'_, AppState>,
    repo_path: &str,
    reference: &str,
    is_merge: bool,
) -> Result<(), AppError> {
    with_handler(&state, &|h| h.revert_commit(repo_path, reference, is_merge))
}
