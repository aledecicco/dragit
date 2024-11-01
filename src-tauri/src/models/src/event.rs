#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum AppEvent {
    /// The app opened a new directory
    DirChanged { path: String },

    /// The .git folder was modified. The result of [`GitHandler::is_repository`] might've changed.
    GitFolderModified,

    /// Branches were created or deleted.
    BranchesUpdated,

    /// A new reference was checked out.
    HeadChanged,

    /// Non-git file/s were created, deleted, or updated.
    FilesModified,

    /// The status of the current commit was updated.
    CommitUpdated,

    /// The current commit's message was updated.
    CommitMessageUpdated,
}
