use notify::{
    event::{CreateKind, ModifyKind, RemoveKind},
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
    get_branches_folder, get_commit_message_file, get_git_folder, get_head_file, get_index_file,
    get_objects_folder,
};

/// A file watcher behind a debouncer, with default options optimized for each platform.
pub struct DefaultDebouncer {
    app_handle: AppHandle,
    debouncer: Option<Debouncer<RecommendedWatcher, FileIdMap>>,
    path: Option<String>,
}

static EVENT_ID: &str = "git-event";

impl DefaultDebouncer {
    pub fn new(app_handle: AppHandle) -> Self {
        DefaultDebouncer {
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
            let objects_folder = get_objects_folder(repo_path);
            let index_file = get_index_file(repo_path);
            let commit_message_file = get_commit_message_file(repo_path);

            match res {
                Ok(events) => {
                    let mut files_modified = false; // TODO: one event for each file?
                    let mut head_changed = false;
                    let mut branches_updated = false; // TODO: one event for each branch?
                    let mut git_folder_modified = false;
                    let mut commit_updated = false;
                    let mut commit_message_updated = false;

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

                        match event.kind {
                            notify::EventKind::Modify(ModifyKind::Data(_)) => {
                                if event.paths.contains(&commit_message_file) {
                                    commit_message_updated = true;
                                }
                            }
                            notify::EventKind::Modify(ModifyKind::Metadata(_)) => {
                                if event.paths.contains(&objects_folder) {
                                    commit_updated = true;
                                }
                            }
                            notify::EventKind::Create(CreateKind::Folder) => {
                                if event.paths.contains(&git_folder) {
                                    git_folder_modified = true;
                                }
                            }
                            notify::EventKind::Create(CreateKind::File) => {
                                if event.paths.contains(&head_file) {
                                    head_changed = true
                                }

                                if event
                                    .paths
                                    .iter()
                                    .any(|path| path.starts_with(&branches_folder))
                                {
                                    branches_updated = true;
                                }

                                if event.paths.contains(&index_file) {
                                    commit_updated = true;
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
                                    branches_updated = true;
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
                    if branches_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::BranchesUpdated);
                    }
                    if git_folder_modified {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::GitFolderModified);
                    }
                    if commit_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::CommitUpdated);
                    }
                    if commit_message_updated {
                        let _ = app_handle.emit(EVENT_ID, AppEvent::CommitMessageUpdated);
                    }
                }
                Err(_) => {} // TODO: warn frontend about possible unsync
            };
        }
    }
}

impl RepoWatcher for DefaultDebouncer {
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
            // TODO: don't repeat error
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
