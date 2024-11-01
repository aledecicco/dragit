use tauri::Manager;

use api;
use git_handler::cmd_git::CmdGit;
use models::AppState;
use repo_watcher::debouncer::DefaultDebouncer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            app.manage(AppState::new(
                Box::new(CmdGit::new()),
                Box::new(DefaultDebouncer::new(app.handle().clone())),
            ));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::open_folder,
            api::get_current_dir,
            api::init_repository,
            api::is_repository,
            api::get_branches,
            api::get_head_info,
            api::checkout_local_branch,
            api::fetch_remote,
            api::get_commit_history,
            api::get_commit_info,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
