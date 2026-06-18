#[derive(thiserror::Error, serde::Serialize, Debug)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum GitError {
    #[error("Failed to start git process \"{command}\"")]
    StartCommandFailed { command: String, reason: String },

    #[error("Git process \"{command}\" failed during execution")]
    CommandFailed { command: String, reason: String },

    #[error("Failed to get output of git command \"{command}\"")]
    GetCommandOutputFailed { command: String, reason: String },

    #[error("Failed to parse output of git command \"{command}\"")]
    ParseCommandOutputFailed { command: String },
}

#[derive(thiserror::Error, serde::Serialize, Debug)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum RepoWatcherError {
    #[error("Failed to setup file watcher")]
    SetupFailed {},

    #[error("No repository is being watched")]
    RepositoryNotWatched {},

    #[error("Failed to watch folder at \"{path}\"")]
    WatchFolderFailed { path: String },

    #[error("Failed to unwatch folder at \"{path}\"")]
    UnwatchFolderFailed { path: String },

    #[error("The path \"{path}\" is not a directory")]
    NotADirectory { path: String },
}

#[derive(thiserror::Error, serde::Serialize, Debug)]
#[serde(
    rename_all(serialize = "camelCase"),
    rename_all_fields = "camelCase",
    tag = "type"
)]
pub enum AppError {
    #[error("Error with git operation: {git_error}")]
    GitOperationFailed { git_error: GitError },

    #[error("Error during file watcher setup")]
    RepoWatcherFailed {
        repo_watcher_error: RepoWatcherError,
    },

    #[error("Failed to update storage")]
    UpdateStorageFailed { reason: String },

    #[error("Failed to serialize the result")]
    SerializationFailed,

    #[error("Failed to read contents of file at \"{path}\"")]
    ReadFileFailed { path: String, reason: String },
}

impl From<GitError> for AppError {
    fn from(git_error: GitError) -> AppError {
        AppError::GitOperationFailed { git_error }
    }
}

impl From<RepoWatcherError> for AppError {
    fn from(repo_watcher_error: RepoWatcherError) -> AppError {
        AppError::RepoWatcherFailed { repo_watcher_error }
    }
}
