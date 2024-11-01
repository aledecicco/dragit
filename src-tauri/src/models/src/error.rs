#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum GitError {
    #[error("Current folder is already a repository")]
    AlreadyARepository {},

    #[error("No repository is open")]
    RepositoryNotOpen {},

    #[error("Failed to open folder at \"{path}\"")]
    OpenFolderFailed { path: String },

    #[error("Failed to retrieve branches")]
    GetBranchesFailed {},

    #[error("Failed to retrieve current branch")]
    GetCurrentBranchFailed {},

    #[error("Failed to checkout branch \"{branch}\"")]
    CheckoutBranchFailed { branch: String },

    #[error("Failed to fetch from remote \"{remote}\"")]
    FetchRemoteFailed { remote: String },

    #[error("Failed to get commit history of \"{reference}\"")]
    GetReferenceHistoryFailed { reference: String },

    #[error("Failed to get commit info of \"{reference}\"")]
    GetCommitInfoFailed { reference: String },

    #[error("Failed to get current HEAD info")]
    GetHeadInfoFailed {},
}

#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum RepoWatcherError {
    #[error("Failed to setup file watcher")]
    SetupFailed {},

    #[error("No repository is being watched")]
    RepositoryNotWatched {},

    #[error("Failed to watch folder at \"{path}\"")]
    WatchFolderFailed { path: String },

    #[error("Failed to unwatch folder at \"{path}\"")]
    UnwatchFolderFailed { path: String },
}

#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum AppError {
    #[error("Error with git operation: {git_error}")]
    GitOperationFailed { git_error: GitError },

    #[error("Error during file watcher setup")]
    RepoWatcherFailed {
        repo_watcher_error: RepoWatcherError,
    },
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
