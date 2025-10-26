#[derive(borsh::BorshSerialize, Debug)]
pub struct Page<T> {
    pub items: Vec<T>,
    pub has_next: bool,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct CurrentDirInfo {
    pub path: String,
    pub is_repository: bool,
    pub exists: bool,
}

#[derive(borsh::BorshSerialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DiffSummary {
    pub files_count: u32,
    pub insertions: u32,
    pub deletions: u32,
}

#[derive(borsh::BorshSerialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommitInfo {
    pub id: String,
    pub short_hash: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: u32,
    pub message: Option<String>,
    pub changes: Option<DiffSummary>,
}

#[derive(borsh::BorshSerialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct StashInfo {
    pub id: String,
    pub stash_number: String,
    pub message: Option<String>,
    pub timestamp: u32,
    pub created_on: String,
    pub changes: Option<DiffSummary>,
}

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum SnapshotInfo {
    Commit(CommitInfo),
    Stash(StashInfo),
}

#[derive(strum::EnumString, Debug)]
pub enum StatusType {
    #[strum(serialize = "1")]
    Modified,

    #[strum(serialize = "2")]
    Moved,

    #[strum(serialize = "u")]
    Unmerged,

    #[strum(serialize = "?")]
    Untracked,
}

#[derive(borsh::BorshSerialize, strum::EnumString, Debug, serde::Deserialize)]
pub enum ChangeStatus {
    #[strum(serialize = "M")]
    Modified,

    #[strum(serialize = "T")]
    TypeChanged,

    #[strum(serialize = "A")]
    Added,

    #[strum(serialize = "D")]
    Deleted,
}

#[derive(borsh::BorshSerialize, strum::EnumString, Debug, serde::Deserialize)]
pub enum MovedStatus {
    #[strum(serialize = "R")]
    Renamed,

    #[strum(serialize = "C")]
    Copied,
}

#[derive(borsh::BorshSerialize, strum::EnumString, Debug, serde::Deserialize)]
pub enum MergeStatus {
    #[strum(serialize = "AA")]
    BothAdded,

    #[strum(serialize = "DD")]
    BothDeleted,

    #[strum(serialize = "UU")]
    BothModified,

    #[strum(serialize = "AU")]
    AddedByUs,

    #[strum(serialize = "DU")]
    DeletedByUs,

    #[strum(serialize = "UA")]
    AddedByThem,

    #[strum(serialize = "UD")]
    DeletedByThem,
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum StagedFileStatus {
    Changed {
        changes: ChangeStatus,
    },

    Moved {
        changes: MovedStatus,
        old_path: String,
    },
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub struct StagedFileInfo {
    pub path: String,
    pub status: StagedFileStatus,
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub struct UnstagedFileInfo {
    pub path: String,
    pub status: ChangeStatus,
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub struct UnmergedFileInfo {
    pub path: String,
    pub status: MergeStatus,
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub struct UntrackedFileInfo {
    pub path: String,
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub enum WorktreeFileInfo {
    Staged(StagedFileInfo),
    Unstaged(UnstagedFileInfo),
    Unmerged(UnmergedFileInfo),
    Untracked(UntrackedFileInfo),
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum VersionedFileStatus {
    Changed {
        changes: ChangeStatus,
    },

    Moved {
        changes: MovedStatus,
        old_path: String,
    },
}

#[derive(borsh::BorshSerialize, Debug, serde::Deserialize)]
pub struct VersionedFileInfo {
    pub path: String,
    pub status: VersionedFileStatus,
}

#[derive(borsh::BorshSerialize, Debug)]
pub enum HeadInfo {
    Detached { commit: String },
    Branch { name: String },
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct AncestorInfo {
    pub hash: String,
    pub distance: u32,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct CommonAncestorInfo {
    pub last_commit: Option<AncestorInfo>,
    pub common_commit: AncestorInfo,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct HistoryItem {
    pub hash: String,
    pub other_parents: Vec<String>,
}

#[derive(borsh::BorshSerialize, Debug)]
pub enum BranchInfo {
    Remote {
        name: String,
        timestamp: u32,
    },
    Local {
        name: String,
        timestamp: u32,
        remote: Option<RemoteRef>,
    },
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct RemoteRef {
    pub remote_name: String,
    pub branch_name: String,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct BranchDivergence {
    pub ahead: u32,
    pub behind: u32,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct RemoteInfo {
    pub name: String,
    pub fetch_url: String,
    pub push_url: String,
}

#[derive(borsh::BorshSerialize, Debug)]
pub enum DiffLine {
    Added(Vec<String>),
    Removed(Vec<String>),
    Unchanged(Vec<String>),
}

#[derive(Debug)]
pub enum ConflictMode {
    Unchanged,
    Common,
    Ours,
    Theirs,
}

#[derive(borsh::BorshSerialize, Debug)]
pub enum ConflictLine {
    Ours(String),
    Theirs(String),
    Unchanged(String),
}
