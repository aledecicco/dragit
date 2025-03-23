use tauri::Manager;

use git_handler::cmd_git::CmdGit;
use models::{AppState, GitHandler, RepoWatcher};
use repo_watcher::debounced_watcher::DebouncedWatcher;
use settings::{get_recent_folders, load_settings};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let mut git_handler = CmdGit::new();
            let mut repo_watcher = DebouncedWatcher::new(app.handle().clone());

            if load_settings(&app.handle()).open_last_on_start {
                if let Some(last) = get_recent_folders(&app.handle()).last() {
                    git_handler.open_folder(&last)?;
                    repo_watcher.watch_repository(&last)?;
                }
            }

            app.manage(AppState::new(Box::new(git_handler), Box::new(repo_watcher)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::open_folder,
            api::get_recently_opened,
            api::get_settings,
            api::set_settings,
            api::get_current_dir,
            api::init_repository,
            api::is_repository,
            api::get_branches,
            api::get_head_info,
            api::checkout_local_branch,
            api::fetch_remote,
            api::get_commit_history,
            api::get_commit_info,
            api::add_to_index,
            api::remove_from_index,
            api::remove_from_tree,
            api::commit_index,
            api::get_common_ancestor,
            api::get_branch_divergence,
            api::push_branch,
            api::pull_branch,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
