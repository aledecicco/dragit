use tauri::ipc::Channel;

use crate::{
    AppMessage, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo, GitError, HeadInfo,
    HistoryItem, Page, RemoteInfo, StashInfo, VersionedFileInfo, WorktreeFileInfo,
};

/// Abstraction for common operations that a git implementation needs to support.
pub trait GitHandler {
    /// Initializes the current open folder as a git repository.
    fn init_repository(&self, repo_path: &str) -> Result<(), GitError>;

    /// Returns whether the current open folder is a git repository.
    fn is_repository(&self, repo_path: &str) -> bool;

    /// Returns the list of the current known local and remote branches.
    fn get_branches(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<BranchInfo>, GitError>;

    /// Switches the current repository to the given ref.
    fn checkout(&self, repo_path: &str, reference: &str) -> Result<(), GitError>;

    /// Returns (a page of) the list of commit hashes leading up to a reference.
    fn get_commit_history_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<HistoryItem>, GitError>;

    /// Returns information about the given commit.
    fn get_commit_info(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference: &str,
    ) -> Result<CommitInfo, GitError>;

    /// Returns information about the current state of the HEAD.
    fn get_head_info(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<HeadInfo, GitError>;

    /// Returns (a page of) the list of files with the given types.
    fn get_worktree_files_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        filter: &FileTypesFilter,
        pathspec: Option<&str>,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<WorktreeFileInfo>, GitError>;

    /// Returns (a page of) the list of files in the given snapshot.
    fn get_snapshot_files_page(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        snapshot_id: &str,
        start_after: usize,
        limit: usize,
    ) -> Result<Page<VersionedFileInfo>, GitError>;

    /// Adds the given list of files to the current index.
    fn add_to_index(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError>;

    /// Removes the given list of files from the current index.
    fn remove_from_index(&self, repo_path: &str, files: &Vec<&str>) -> Result<(), GitError>;

    /// Commits the current index with the given message.
    fn commit_index(&self, repo_path: &str, message: &str, is_amend: bool) -> Result<(), GitError>;

    /// Returns the commit hash of the latest common ancestor between the two given branches.
    fn get_common_ancestor(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference_a: &str,
        reference_b: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError>;

    /// Returns the number of commits that the given branch is ahead/behind another (possibly its remote counterpart).
    fn get_branch_divergence(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError>;

    /// Pushes the given branch, updating the refspec specified by the remote name and the remote branch.
    fn push_branch(
        &self,
        repo_path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_force: bool,
        set_upstream: bool,
    ) -> Result<(), GitError>;

    /// Pulls the given branch, updating it from the refspec specified by the remote name and the remote branch.
    fn pull_branch(
        &self,
        repo_path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_rebase: bool,
    ) -> Result<(), GitError>;

    /// Fast-forwards the given branch, updating it from the refspec specified by the remote name and the remote branch.
    /// This is similar to pulling, but can be used without checking out the branch first.
    fn fast_forward_branch(
        &self,
        repo_path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
    ) -> Result<(), GitError>;

    /// Returns the list of available remotes.
    fn get_remotes(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<RemoteInfo>, GitError>;

    /// Fetches the given remote, updating the remote references.
    fn fetch_remote(&self, repo_path: &str, remote: &str) -> Result<(), GitError>;

    /// Sets the remote reference of an existing branch.
    fn set_upstream(&self, repo_path: &str, branch: &str, remote_ref: &str)
        -> Result<(), GitError>;

    /// Adds a new remote.
    fn add_remote(&self, repo_path: &str, name: &str, url: &str) -> Result<(), GitError>;

    /// Removes an existing remote.
    fn remove_remote(&self, repo_path: &str, name: &str) -> Result<(), GitError>;

    /// Changes the name of an existing remote.
    fn rename_remote(&self, repo_path: &str, name: &str, new_name: &str) -> Result<(), GitError>;

    /// Changes the URL of an existing remote.
    fn change_remote_url(&self, repo_path: &str, name: &str, new_url: &str)
        -> Result<(), GitError>;

    /// Returns the list of stashed changes.
    fn get_stashes(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
    ) -> Result<Vec<StashInfo>, GitError>;

    /// Stashes the given files with an optional message.
    fn stash(
        &self,
        repo_path: &str,
        message: Option<&str>,
        files: &Vec<&str>,
        include_untracked: bool,
    ) -> Result<(), GitError>;

    /// Applies the given stash to the current working directory.
    fn apply_stash(&self, repo_path: &str, stash_id: &str) -> Result<(), GitError>;

    /// Discards the given stash.
    fn discard_stash(&self, repo_path: &str, stash_id: &str) -> Result<(), GitError>;

    /// Returns the contents of a file at a given point.
    fn get_file_contents(
        &self,
        channel: &Channel<AppMessage>,
        repo_path: &str,
        reference: &str,
        filepath: &str,
    ) -> Result<String, GitError>;

    /// Solves a file conflict using the given strategy.
    fn solve_file_conflict(
        &self,
        repo_path: &str,
        filepath: &str,
        strategy: &ResolutionStrategy,
    ) -> Result<(), GitError>;
}

#[derive(serde::Deserialize, Debug)]
pub struct FileTypesFilter {
    pub staged: Option<bool>,
    pub unstaged: Option<bool>,
    pub unmerged: Option<bool>,
    pub untracked: Option<bool>,
}

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ResolutionStrategy {
    Ours,
    Theirs,
}
