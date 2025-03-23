pub static EVENT_ID: &str = "app-event";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum AppEvent {
    /// The app tried to open the last folder used, but it's no longer there.
    DirDisappeared { path: String },

    /// The app opened a new directory.
    DirChanged,

    /// The .git folder was modified. The result of [`GitHandler::is_repository`] might've changed.
    GitFolderModified,

    /// Branches were created or deleted.
    BranchesListUpdated,

    /// The state or history of a branch was updated.
    BranchUpdated { name: String },

    /// A new reference was checked out.
    HeadChanged,

    /// Non-git file/s were created, deleted, or updated.
    FilesModified,

    /// The config file was updated.
    ConfigUpdated,

    /// The status of the current commit was updated.
    IndexUpdated,
}
