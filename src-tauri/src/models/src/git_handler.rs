use crate::{
    error::GitError, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo, HeadInfo,
    HistoryItem,
};

/// Abstraction for common operations that a git implementation needs to support.
pub trait GitHandler {
    /// Initializes the current open folder as a git repository.
    fn init_repository(&self, path: &str) -> Result<(), GitError>;

    /// Returns whether the current open folder is a git repository.
    fn is_repository(&self, path: &str) -> bool;

    /// Returns a list of the current known local and remote branches.
    fn get_branches(&self, path: &str) -> Result<Vec<BranchInfo>, GitError>;

    /// Switches the current repository to a local branch.
    fn checkout_local_branch(&self, path: &str, branch: &str) -> Result<(), GitError>;

    /// Fetches the given remote, updating the remote references.
    fn fetch_remote(&self, path: &str, remote: &str) -> Result<(), GitError>;

    /// Returns the list of commit hashes leading up to a reference.
    fn get_commit_history(
        &self,
        path: &str,
        reference: &str,
        start_after: u8,
        limit: u8,
    ) -> Result<Vec<HistoryItem>, GitError>;

    /// Returns information about the given commit.
    fn get_commit_info(&self, path: &str, reference: &str) -> Result<CommitInfo, GitError>;

    /// Returns information about the current state of the HEAD.
    fn get_head_info(&self, path: &str) -> Result<HeadInfo, GitError>;

    /// Adds the given list of files to the current index.
    fn add_to_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError>;

    /// Removes the given list of files from the current index.
    fn remove_from_index(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError>;

    /// Removes the given list of files from the tree and the current index.
    fn remove_from_tree(&self, path: &str, files: &Vec<&str>) -> Result<(), GitError>;

    /// Commits the current index with the given message.
    fn commit_index(&self, path: &str, message: &str, is_amend: bool) -> Result<(), GitError>;

    /// Returns the commit hash of the latest common ancestor between the two given branches.
    fn get_common_ancestor(
        &self,
        path: &str,
        branch_a: &str,
        branch_b: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError>;

    /// Returns the number of commits that the given branch is ahead/behind another (possibly its remote counterpart).
    fn get_branch_divergence(
        &self,
        path: &str,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError>;

    /// Pushes the given branch, updating the refspec specified by the remote name and the remote branch.
    fn push_branch(
        &self,
        path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_force: bool,
        set_upstream: bool,
    ) -> Result<(), GitError>;

    /// Pulls the given branch, updating it from the refspec specified by the remote name and the remote branch.
    fn pull_branch(
        &self,
        path: &str,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_rebase: bool,
    ) -> Result<(), GitError>;
}
