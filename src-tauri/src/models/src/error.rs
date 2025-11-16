#[derive(thiserror::Error, serde::Serialize, Debug)]
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

    #[error("Failed to create branch \"{branch_name}\"")]
    CreateBranchFailed { branch_name: String },

    #[error("Failed to delete branch \"{branch_name}\"")]
    DeleteBranchFailed { branch_name: String },

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

    #[error("Failed to remove files from tree")]
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

    #[error("Failed to fast-forward \"{branch}\" from refspec \"{remote}\"/\"{remote_branch}\"")]
    FastForwardBranchFailed {
        branch: String,
        remote: String,
        remote_branch: String,
    },

    #[error("Failed to retrieve remotes")]
    GetRemotesFailed {},

    #[error("Failed to fetch from remote \"{name}\"")]
    FetchRemoteFailed { name: String },

    #[error("Failed to set upstream of \"{branch}\" to \"{remote_ref}\"")]
    SetUpstreamFailed { branch: String, remote_ref: String },

    #[error("Failed to add remote \"{name}\"")]
    AddRemoteFailed { name: String },

    #[error("Failed to remove remote \"{name}\"")]
    RemoveRemoteFailed { name: String },

    #[error("Failed to rename remote \"{name}\"")]
    RenameRemoteFailed { name: String },

    #[error("Failed to change URL of remote \"{name}\"")]
    ChangeRemoteUrlFailed { name: String },

    #[error("Failed to retrieve stashes")]
    GetStashesFailed {},

    #[error("Failed to create stash")]
    CreateStashFailed {},

    #[error("Failed to apply stash #{stash_id}")]
    ApplyStashFailed { stash_id: String },

    #[error("Failed to drop stash #{stash_id}")]
    DiscardStashFailed { stash_id: String },

    #[error("Failed to get contents of file \"#{filepath}\" on \"#{reference}\"")]
    GetFileContentsFailed { reference: String, filepath: String },

    #[error("Failed to solve file conflict for \"{filepath}\"")]
    SolveFileConflictFailed { filepath: String },
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

    #[error("Failed to read contents of file at \"{path}\"")]
    ReadFileFailed { path: String },
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
