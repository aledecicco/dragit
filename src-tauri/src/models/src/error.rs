#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum GitError {
    #[error("Failed to start git process \"{args:?}\"")]
    StartCommandFailed { args: Vec<String> },

    #[error("Failed to get command output")]
    GetCommandOutputFailed {},

    #[error("No repository is open")]
    RepositoryNotOpen {},

    #[error("Failed to init repository at \"{path}\"")]
    InitRepositoryFailed { path: String },

    #[error("The path \"{path}\" is not a directory")]
    NotADirectory { path: String },

    #[error("Failed to retrieve branches")]
    GetBranchesFailed {},

    #[error("Failed to retrieve current branch")]
    GetCurrentBranchFailed {},

    #[error("Failed to checkout \"{reference}\"")]
    CheckoutFailed { reference: String },

    #[error("Failed to get commit history of \"{reference}\"")]
    GetReferenceHistoryFailed { reference: String },

    #[error("Failed to get commit info of \"{reference}\"")]
    GetCommitInfoFailed { reference: String },

    #[error("Failed to get current HEAD info")]
    GetHeadInfoFailed {},

    #[error("Failed to get current staged files")]
    GetStagedFilesFailed {},

    #[error("Failed to get current unstaged files")]
    GetUnstagedFilesFailed {},

    #[error("Failed to get current unmerged files")]
    GetUnmergedFilesFailed {},

    #[error("Failed to get current untracked files")]
    GetUntrackedFilesFailed {},

    #[error("Failed to add files to the index")]
    AddToIndexFailed {},

    #[error("Failed to remove files from the index")]
    RemoveFromIndexFailed {},

    #[error("Failed to remove files from the tree")]
    RemoveFromTreeFailed {},

    #[error("Failed to commit the current index")]
    CommitFailed {},

    #[error("Failed to get common ancestor of \"{branch}\" and \"{base_branch}\"")]
    GetCommonAncestorFailed { branch: String, base_branch: String },

    #[error("Failed to get divergence between \"{branch}\" and \"{base_branch}\"")]
    GetBranchDivergenceFailed { branch: String, base_branch: String },

    #[error("Failed to push \"{branch}\" to refspec \"{remote}\"/\"{remote_branch}\"")]
    PushBranchFailed {
        branch: String,
        remote: String,
        remote_branch: String,
    },

    #[error("Failed to pull \"{branch}\" from refspec \"{remote}\"/\"{remote_branch}\"")]
    PullBranchFailed {
        branch: String,
        remote: String,
        remote_branch: String,
    },

    #[error("Failed to retrieve remotes")]
    GetRemotesFailed {},

    #[error("Failed to fetch from remote \"{name}\"")]
    FetchRemoteFailed { name: String },

    #[error("Failed to add remote \"{name}\"")]
    AddRemoteFailed { name: String },

    #[error("Failed to remove remote \"{name}\"")]
    RemoveRemoteFailed { name: String },

    #[error("Failed to retrieve stashes")]
    GetStashesFailed {},
}

#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
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

#[derive(thiserror::Error, serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum AppError {
    #[error("Error with git operation: {git_error}")]
    GitOperationFailed { git_error: GitError },

    #[error("Error during file watcher setup")]
    RepoWatcherFailed {
        repo_watcher_error: RepoWatcherError,
    },

    #[error("Failed to save settings")]
    SaveSettingsFailed {},

    #[error("Failed to remove \"{path}\" from the recent folders list")]
    RemoveFromRecentFailed { path: String },

    #[error("Failed to serialize the result")]
    SerializationFailed,
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
