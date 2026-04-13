pub static EVENT_ID: &str = "app-event";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "type"
)]
pub enum AppEvent {
    /// The settings were updated.
    SettingsChanged,

    /// The app opened a new directory.
    DirChanged,

    /// The app tried to open the last folder used, but it's no longer there.
    DirDisappeared { repo_path: String },

    /// The .git folder was modified. The result of [`GitHandler::is_repository`] might've changed.
    GitFolderModified { repo_path: String },

    /// Branches were created or deleted.
    BranchesListUpdated { repo_path: String },

    /// The state or history of a branch was updated.
    BranchUpdated { repo_path: String, name: String },

    /// A new reference was checked out.
    HeadChanged { repo_path: String },

    /// Non-git file/s were created, deleted, or updated.
    FilesModified { repo_path: String },

    /// The config file was updated.
    ConfigUpdated { repo_path: String },

    /// The status of the current commit was updated.
    IndexUpdated { repo_path: String },

    /// The stashes were updated.
    StashesUpdated { repo_path: String },

    /// The tags were updated.
    TagsUpdated { repo_path: String },
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum AppMessage {
    ProcessStarted { pid: u32 },
}
