use std::path::Path;
use tauri::{Emitter, Listener, Manager};

use git_handler::cmd_git::CmdGit;
use models::{AppEvent, AppState, RepoWatcher, EVENT_ID};
use repo_watcher::debounced_watcher::DebouncedWatcher;
use storage::{get_storage, remove_last_opened, remove_recent_folder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle();
            let git_handler = CmdGit::new();
            let mut repo_watcher = DebouncedWatcher::new(app_handle.clone());

            let stored = get_storage(app_handle);

            if stored.settings.open_last_on_start {
                if let Some(last) = stored.last_opened {
                    if Path::new(&last).is_dir() {
                        repo_watcher.watch_repository(&last)?;
                    } else {
                        let new_handle = app_handle.clone();
                        let dir_path = last.clone();

                        app_handle.once(EVENT_ID, move |event| {
                            if let Ok(payload) = serde_json::from_str::<AppEvent>(&event.payload())
                            {
                                if let AppEvent::FrontendReady = payload {
                                    let _ = new_handle.emit(
                                        EVENT_ID,
                                        AppEvent::DirDisappeared {
                                            repo_path: dir_path.to_string(),
                                        },
                                    );
                                }
                            }
                        });

                        let _ = remove_recent_folder(app_handle, &last);
                        let _ = remove_last_opened(app_handle);
                    }
                }
            }

            app.manage(AppState::new(Box::new(git_handler), Box::new(repo_watcher)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::open_folder,
            api::get_app_storage,
            api::set_settings,
            api::set_repository_storage,
            api::get_current_dir,
            api::init_repository,
            api::get_branches,
            api::get_head_info,
            api::get_worktree_files_page,
            api::get_versioned_files_page,
            api::checkout,
            api::create_branch,
            api::delete_local_branches,
            api::delete_remote_branches,
            api::get_commit_history_page,
            api::get_commit_info,
            api::get_diff_summary,
            api::add_to_index,
            api::remove_from_index,
            api::remove_from_tree,
            api::clean_files,
            api::commit_index,
            api::reset_head,
            api::restore,
            api::get_common_ancestor,
            api::get_branch_divergence,
            api::push_branch,
            api::pull_branch,
            api::fast_forward_branch,
            api::get_remotes,
            api::fetch_remote,
            api::set_upstream,
            api::add_remote,
            api::remove_remote,
            api::rename_remote,
            api::change_remote_url,
            api::get_stashes,
            api::stash,
            api::apply_stash,
            api::discard_stashes,
            api::get_tags,
            api::tag,
            api::push_tag,
            api::delete_local_tags,
            api::delete_remote_tags,
            api::get_file_diff,
            api::get_file_conflicts,
            api::solve_file_conflicts,
            api::abort_merge,
            api::continue_merge,
            api::abort_rebase,
            api::continue_rebase,
            api::continue_cherry_pick,
            api::abort_cherry_pick,
            api::abort_revert,
            api::continue_revert,
            api::merge,
            api::revert_commit,
            api::cherry_pick,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running application");
}
