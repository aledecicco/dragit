use crate::error::RepoWatcherError;

/// Abstraction for common operations that a file watcher over a repository needs to support.
pub trait RepoWatcher {
    /// Returns the path of the current folder, failing if no folder is being watched.
    fn get_path(&self) -> Result<String, RepoWatcherError>;

    /// Begin listening for events on a path, failing if it doesn't exist.
    fn watch_repo(&mut self, path: &str) -> Result<(), RepoWatcherError>;

    /// Stop listening for events on the watched repository, failing if it wasn't being watched.
    fn unwatch_repo(&mut self) -> Result<(), RepoWatcherError>;
}
