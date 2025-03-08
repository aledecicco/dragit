use notify::{
    event::{CreateKind, RemoveKind},
    RecommendedWatcher, Watcher,
};
use notify_debouncer_full::{
    new_debouncer, DebounceEventHandler, DebouncedEvent, Debouncer, FileIdMap,
};
use std::{
    path::{Path, PathBuf},
    time::Duration,
};
use tauri::{AppHandle, Emitter};

use models::{AppEvent, RepoWatcher, RepoWatcherError};

use crate::{
    get_branches_folder, get_config_folder, get_git_folder, get_head_file, get_index_file,
    get_objects_folder, get_remotes_folder,
};

/// Implementation of [`RepoWatcher`] that uses a debouncer to group events.
pub struct DebouncedWatcher {
    app_handle: AppHandle,
    debouncer: Option<Debouncer<RecommendedWatcher, FileIdMap>>,
    path: Option<String>,
}

static EVENT_ID: &str = "git-event";

impl DebouncedWatcher {
    pub fn new(app_handle: AppHandle) -> Self {
        DebouncedWatcher {
            app_handle: app_handle,
            debouncer: None,
            path: None,
        }
    }

    fn get_event_handler(&self, repo_path: &str) -> impl DebounceEventHandler {
        let repo_path = repo_path.to_string();
        let app_handle = self.app_handle.clone();
        move |res: Result<Vec<DebouncedEvent>, Vec<notify::Error>>| {
            let repo_path = Path::new(&repo_path);
            let git_folder = get_git_folder(repo_path);
            let head_file = get_head_file(repo_path);
            let branches_folder = get_branches_folder(repo_path);
            let remotes_folder = get_remotes_folder(repo_path);
            let config_folder = get_config_folder(repo_path);
            let objects_folder = get_objects_folder(repo_path);
            let index_file = get_index_file(repo_path);

            match res {
                Ok(events) => {
                    let mut files_modified = false;
                    let mut head_changed = false;
                    let mut git_folder_modified = false;
                    let mut config_updated = false;
                    let mut index_updated = false;
                    let mut branches_list_updated = false;

                    events.iter().for_each(|event| {
                        println!("{:?}", event.kind);
                        event.paths.iter().for_each(|path| println!("{:?}", path));

                        if event
                            .paths
                            .iter()
                            .any(|path| !path.starts_with(&git_folder))
                        {
                            files_modified = true;
                        }

                        if event.paths.contains(&config_folder) {
                            config_updated = true;
                        }

                        if event.paths.contains(&objects_folder) {
                            index_updated = true;
                        }

                        event.paths.iter().for_each(|path| {
                            if path.starts_with(&branches_folder) && path.is_file() {
                                if let Ok(Some(branch_name)) = path
                                    .strip_prefix(&branches_folder)
                                    .map(|path| path.to_str())
                                {
                                    let _ = app_handle.emit(
                                        EVENT_ID,
                                        AppEvent::BranchUpdated {
                                            name: branch_name.to_string(),
                                        },
                                    );
                                    println!("branch updated {}", branch_name);
                                }
                            }

                            if path.starts_with(&remotes_folder) && path.is_file() {
                                if let Ok(Some(branch_name)) =
                                    path.strip_prefix(&remotes_folder).map(|path| path.to_str())
                                {
                                    let _ = app_handle.emit(
                                        EVENT_ID,
                                        AppEvent::BranchUpdated {
                                            name: branch_name.to_string(),
                                        },
                                    );
                                    println!("remote branch updated {}", branch_name);
                                }
                            }
                        });

                        match event.kind {
                            notify::EventKind::Create(CreateKind::Folder) => {
                                if event.paths.contains(&git_folder) {
                                    git_folder_modified = true;
                                }
                            }
                            notify::EventKind::Create(CreateKind::File) => {
                                if event.paths.contains(&head_file) {
                                    head_changed = true
                                }

                                if event.paths.iter().any(|path| {
                                    path.starts_with(&branches_folder)
                                        || path.starts_with(&remotes_folder)
                                }) {
                                    branches_list_updated = true;
                                }

                                if event.paths.contains(&index_file) {
                                    index_updated = true;
                                }
                            }
                            notify::EventKind::Remove(RemoveKind::Folder) => {
                                if event.paths.contains(&git_folder) {
                                    git_folder_modified = true;
                                }
                            }
                            notify::EventKind::Remove(RemoveKind::File) => {
                                if event
                                    .paths
                                    .iter()
                                    .any(|path| path.starts_with(&branches_folder))
                                {
                                    branches_list_updated = true;
                                }
                            }
                            _ => {}
                        }
                    });
                    println!("");

                    if files_modified {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::FilesModified);
                    }

                    if head_changed {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::HeadChanged);
                    }

                    if branches_list_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::BranchesListUpdated);
                    }

                    if git_folder_modified {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::GitFolderModified);
                    }

                    if config_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::ConfigUpdated);
                    }

                    if index_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::IndexUpdated);
                    }

                    println!(
                        "files: {} head: {} branches: {} gitfolder: {} index: {}\n\n",
                        files_modified,
                        head_changed,
                        branches_list_updated,
                        git_folder_modified,
                        index_updated,
                    );
                }
                Err(_) => {} // TODO: warn frontend about possible unsync
            };
        }
    }
}

impl RepoWatcher for DebouncedWatcher {
    fn get_path(&self) -> Result<String, RepoWatcherError> {
        let path = self
            .path
            .as_ref()
            .ok_or(RepoWatcherError::RepositoryNotWatched {})?;
        Ok(path.to_string())
    }

    fn watch_repo(&mut self, repo_path: &str) -> Result<(), RepoWatcherError> {
        if Path::new(repo_path).is_dir() {
            let event_handler = self.get_event_handler(repo_path);

            let mut debouncer = new_debouncer(Duration::from_millis(100), None, event_handler)
                .or(Err(RepoWatcherError::SetupFailed {}))?;

            debouncer
                .watcher()
                .watch(&PathBuf::from(repo_path), notify::RecursiveMode::Recursive)
                .or(Err(RepoWatcherError::WatchFolderFailed {
                    path: repo_path.to_string(),
                }))?;

            self.path = Some(repo_path.to_string());
            self.debouncer = Some(debouncer);

            Ok(())
        } else {
            Err(RepoWatcherError::WatchFolderFailed {
                path: repo_path.to_string(),
            })
        }
    }

    fn unwatch_repo(&mut self) -> Result<(), RepoWatcherError> {
        let repo_path = self.get_path()?;
        self.debouncer
            .as_mut()
            .ok_or(RepoWatcherError::RepositoryNotWatched {})?
            .watcher()
            .unwatch(&PathBuf::from(repo_path.to_string()))
            .or(Err(RepoWatcherError::UnwatchFolderFailed {
                path: repo_path.to_string(),
            }))
    }
}
