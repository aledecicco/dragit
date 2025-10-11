use crate::{VersionedFileInfo, WorktreeFileInfo};

#[derive(Debug, serde::Deserialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "type"
)]
pub enum DiffScope {
    Worktree {
        file: WorktreeFileInfo,
    },

    Snapshot {
        snapshot_id: String,
        file: VersionedFileInfo,
    },
}

#[derive(Debug)]
pub enum DiffSource {
    GitReference(String, String),
    DiskFile(String),
    Empty,
}
