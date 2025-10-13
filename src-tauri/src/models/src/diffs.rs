use crate::{
    StagedFileInfo, UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo, VersionedFileInfo,
};

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DiffStage {
    Ours,
    Theirs,
    Both,
}

#[derive(Debug, serde::Deserialize)]
pub enum CleanFileInfo {
    Staged(StagedFileInfo),
    Unstaged(UnstagedFileInfo),
    Untracked(UntrackedFileInfo),
}

#[derive(Debug, serde::Deserialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "type"
)]
pub enum DiffScope {
    Unmerged {
        file: UnmergedFileInfo,
        stage: DiffStage,
    },

    Worktree {
        file: CleanFileInfo,
    },

    Snapshot {
        file: VersionedFileInfo,
        snapshot_id: String,
    },
}

#[derive(Debug)]
pub enum DiffSource {
    GitReference(String, String),
    DiskFile(String),
    Empty,
}
