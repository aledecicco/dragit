use crate::{
    StagedFileInfo, UnmergedFileInfo, UnstagedFileInfo, UntrackedFileInfo, VersionedFileInfo,
};

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MergeDiffStage {
    Ours,
    Theirs,
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
        stage: MergeDiffStage,
    },

    Worktree {
        file: CleanFileInfo,
    },

    Versioned {
        file: VersionedFileInfo,
        reference: String,
        against: Option<String>,
    },
}

#[derive(Debug)]
pub enum DiffSource {
    GitReference(String, String),
    DiskFile(String),
    Empty,
}

#[derive(Debug)]
pub enum DiffMode {
    Unchanged,
    Added,
    Removed,
}
