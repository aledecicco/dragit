use crate::{error::GitError, CommitInfo, HeadInfo};

/// Abstraction for common operations that a git implementation needs to support.
pub trait GitHandler {
    /// Returns the path of the current open folder, failing if no folder is open.
    fn get_path(&self) -> Result<String, GitError>;

    /// Opens a folder for the handler to control, failing if it doesn't exist.
    fn open_folder(&mut self, path: &str) -> Result<(), GitError>;

    /// Initializes the current open folder as a git repository.
    fn init_repository(&self) -> Result<(), GitError>;

    /// Returns whether the current open folder is a git repository.
    fn is_repository(&self) -> bool;

    /// Returns a list of the current known local and remote branches.
    fn get_branches(&self) -> Result<Vec<String>, GitError>;

    /// Switches the current repository to a local branch.
    fn checkout_local_branch(&self, branch: &str) -> Result<(), GitError>;

    /// Fetches the given remote, updating the remote references.
    fn fetch_remote(&self, remote: &str) -> Result<(), GitError>;

    /// Returns the list of commit hashes leading up to a branch.
    fn get_commit_history(
        &self,
        reference: &str,
        start_after: u8,
        limit: u8,
    ) -> Result<Vec<String>, GitError>;

    /// Returns information about the given commit.
    fn get_commit_info(&self, commit: &str) -> Result<CommitInfo, GitError>;

    /// Returns information about the current state of the HEAD.
    fn get_head_info(&self) -> Result<HeadInfo, GitError>;
}
