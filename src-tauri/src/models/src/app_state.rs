use parking_lot::Mutex;

use crate::{git_handler::GitHandler, repo_watcher::RepoWatcher};

/// A git handler that has known size and can be sent between threads.
pub type SafeHandler = Box<dyn GitHandler + Send + Sync>;
/// A file watcher that has known size and can be sent between threads.
pub type SafeWatcher = Box<dyn RepoWatcher + Send + Sync>;

/// The state tracked by the app, which should be shareable by many threads.
pub struct AppState {
    pub git_handler: Mutex<SafeHandler>,
    pub repo_watcher: Mutex<SafeWatcher>,
}

impl AppState {
    /// Initialize the app state with the given implementations.
    pub fn new(git_handler: SafeHandler, repo_watcher: SafeWatcher) -> Self {
        AppState {
            git_handler: Mutex::new(git_handler),
            repo_watcher: Mutex::new(repo_watcher),
        }
    }
}
