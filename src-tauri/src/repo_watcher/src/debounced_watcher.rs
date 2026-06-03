use notify::{
    event::{CreateKind, EventKindMask, RemoveKind},
    RecommendedWatcher,
};
use notify_debouncer_full::{
    new_debouncer, DebounceEventHandler, DebouncedEvent, Debouncer, RecommendedCache,
};
use std::{
    path::{Path, PathBuf},
    time::Duration,
};
use tauri::{AppHandle, Emitter};

use models::{AppEvent, RepoWatcher, RepoWatcherError, EVENT_ID};
use utils::{
    get_branches_folder, get_cherry_pick_head_file, get_config_folder, get_git_folder,
    get_head_file, get_index_file, get_merge_head_file, get_objects_folder, get_rebase_head_file,
    get_remotes_folder, get_revert_head_file, get_stashes_file, get_tags_folder,
};

/// Implementation of [`RepoWatcher`] that uses a debouncer to group events.
pub struct DebouncedWatcher {
    app_handle: AppHandle,
    debouncer: Option<Debouncer<RecommendedWatcher, RecommendedCache>>,
    path: Option<String>,
}

impl DebouncedWatcher {
    pub fn new(app_handle: AppHandle) -> Self {
        DebouncedWatcher {
            app_handle: app_handle,
            debouncer: None,
            path: None,
        }
    }

    fn get_event_handler(&self, pathname: &str) -> impl DebounceEventHandler {
        let pathname = pathname.to_string();
        let app_handle = self.app_handle.clone();

        let repo_path = PathBuf::from(&pathname);
        let git_folder = get_git_folder(&repo_path);
        let head_file = get_head_file(&repo_path);
        let branches_folder = get_branches_folder(&repo_path);
        let remotes_folder = get_remotes_folder(&repo_path);
        let config_folder = get_config_folder(&repo_path);
        let objects_folder = get_objects_folder(&repo_path);
        let index_file = get_index_file(&repo_path);
        let stashes_file = get_stashes_file(&repo_path);
        let tags_folder = get_tags_folder(&repo_path);
        let merge_head_file = get_merge_head_file(&repo_path);
        let rebase_head_file = get_rebase_head_file(&repo_path);
        let cherry_pick_head_file = get_cherry_pick_head_file(&repo_path);
        let revert_head_file = get_revert_head_file(&repo_path);

        move |res: Result<Vec<DebouncedEvent>, Vec<notify::Error>>| {
            match res {
                Ok(events) => {
                    let mut folder_modified = false;
                    let mut files_modified = false;
                    let mut head_changed = false;
                    let mut git_folder_modified = false;
                    let mut config_updated = false;
                    let mut index_updated = false;
                    let mut stashes_updated = false;
                    let mut tags_updated = false;
                    let mut branches_list_updated = false;

                    events
                        .iter()
                        .filter(|event| EventKindMask::CORE.matches(&event.kind))
                        .for_each(|event| {
                            if event.paths.iter().any(|path| path.eq(&repo_path)) {
                                folder_modified = true;
                            }

                            if event.paths.contains(&git_folder) {
                                git_folder_modified = true;
                            }

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

                            if event.paths.contains(&index_file) {
                                index_updated = true;
                            }

                            if event.paths.contains(&stashes_file) {
                                stashes_updated = true;
                            }

                            if event.paths.contains(&merge_head_file)
                                || event.paths.contains(&rebase_head_file)
                                || event.paths.contains(&cherry_pick_head_file)
                                || event.paths.contains(&revert_head_file)
                            {
                                head_changed = true;
                            }

                            event.paths.iter().for_each(|path| {
                                if path.starts_with(&tags_folder) {
                                    tags_updated = true;
                                }

                                if path.starts_with(&branches_folder) && path.is_file() {
                                    if let Ok(Some(branch_name)) = path
                                        .strip_prefix(&branches_folder)
                                        .map(|path| path.to_str())
                                    {
                                        let _ = app_handle.emit(
                                            EVENT_ID,
                                            AppEvent::BranchUpdated {
                                                name: branch_name.to_string(),
                                                repo_path: pathname.to_string(),
                                            },
                                        );
                                    }
                                }

                                if path.starts_with(&remotes_folder) {
                                    branches_list_updated = true;

                                    if let Ok(Some(branch_name)) =
                                        path.strip_prefix(&remotes_folder).map(|path| path.to_str())
                                    {
                                        let _ = app_handle.emit(
                                            EVENT_ID,
                                            AppEvent::BranchUpdated {
                                                name: branch_name.to_string(),
                                                repo_path: pathname.to_string(),
                                            },
                                        );
                                    }
                                }
                            });

                            match event.kind {
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

                    if folder_modified {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::DirChanged);
                    }

                    if files_modified {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::FilesModified {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if head_changed {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::HeadChanged {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if branches_list_updated {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::BranchesListUpdated {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if git_folder_modified {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::GitFolderModified {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if config_updated {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::ConfigUpdated {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if index_updated {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::IndexUpdated {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if stashes_updated {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::StashesUpdated {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }

                    if tags_updated {
                        let _ = app_handle.emit(
                            EVENT_ID,
                            AppEvent::TagsUpdated {
                                repo_path: pathname.to_string(),
                            },
                        );
                    }
                }
                Err(_errs) => {
                    // TODO: warn frontend about possible unsync
                }
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

    fn watch_repository(&mut self, repo_path: &str) -> Result<(), RepoWatcherError> {
        if Path::new(repo_path).is_dir() {
            let event_handler = self.get_event_handler(repo_path);

            let mut debouncer = new_debouncer(Duration::from_millis(300), None, event_handler)
                .or(Err(RepoWatcherError::SetupFailed {}))?;

            debouncer
                .watch(&PathBuf::from(repo_path), notify::RecursiveMode::Recursive)
                .or(Err(RepoWatcherError::WatchFolderFailed {
                    path: repo_path.to_string(),
                }))?;

            self.path = Some(repo_path.to_string());
            self.debouncer = Some(debouncer);

            Ok(())
        } else {
            Err(RepoWatcherError::NotADirectory {
                path: repo_path.to_string(),
            })
        }
    }

    fn unwatch_repository(&mut self) -> Result<(), RepoWatcherError> {
        // Drop watcher and let it handle things.
        self.debouncer = None;
        self.path = None;

        Ok(())
    }
}
