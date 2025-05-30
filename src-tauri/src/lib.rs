use std::path::Path;
use tauri::{Emitter, Manager};

use git_handler::cmd_git::CmdGit;
use models::{AppEvent, AppState, RepoWatcher, EVENT_ID};
use repo_watcher::debounced_watcher::DebouncedWatcher;
use settings::{get_last_opened, load_settings, remove_last_opened, remove_recent_folder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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

            if load_settings(app_handle).open_last_on_start {
                if let Some(last) = get_last_opened(app_handle) {
                    if Path::new(&last).is_dir() {
                        repo_watcher.watch_repository(&last)?;
                    } else {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::DirDisappeared {
                                path: last.to_string(),
                            },
                        );
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
            api::get_recently_opened,
            api::remove_from_recent,
            api::get_settings,
            api::set_settings,
            api::get_current_dir,
            api::init_repository,
            api::get_branches,
            api::get_head_info,
            api::get_files_page,
            api::get_commit_files_page,
            api::checkout,
            api::get_commit_history_page,
            api::get_commit_info,
            api::add_to_index,
            api::remove_from_index,
            api::remove_from_tree,
            api::commit_index,
            api::get_common_ancestor,
            api::get_branch_divergence,
            api::push_branch,
            api::pull_branch,
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
            api::discard_stash,
            api::get_file_diff,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
