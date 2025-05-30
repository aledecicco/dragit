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

#[derive(borsh::BorshSerialize, Debug)]
pub struct DiffSummary {
    pub files_count: u32,
    pub insertions: u32,
    pub deletions: u32,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct CommitInfo {
    pub hash: String,
    pub short_hash: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: u32,
    pub message: Option<String>,
    pub changes: Option<DiffSummary>,
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

#[derive(borsh::BorshSerialize, strum::EnumString, Debug)]
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

#[derive(borsh::BorshSerialize, strum::EnumString, Debug)]
pub enum MovedStatus {
    #[strum(serialize = "R")]
    Renamed,

    #[strum(serialize = "C")]
    Copied,
}

#[derive(borsh::BorshSerialize, strum::EnumString, Debug)]
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

#[derive(borsh::BorshSerialize, Debug)]
pub enum StagedFileStatus {
    Changed {
        changes: ChangeStatus,
    },

    Moved {
        changes: MovedStatus,
        old_path: String,
    },
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct StagedFileInfo {
    pub path: String,

    pub status: StagedFileStatus,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct UnstagedFileInfo {
    pub path: String,

    pub status: ChangeStatus,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct UnmergedFileInfo {
    pub path: String,

    pub status: MergeStatus,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct UntrackedFileInfo {
    pub path: String,
}

#[derive(borsh::BorshSerialize, Debug)]
pub enum FileInfo {
    Staged(StagedFileInfo),
    Unstaged(UnstagedFileInfo),
    Unmerged(UnmergedFileInfo),
    Untracked(UntrackedFileInfo),
}

#[derive(borsh::BorshSerialize, strum::EnumString, Debug)]
pub enum CommittedStatus {
    #[strum(serialize = "M")]
    Modified,

    #[strum(serialize = "T")]
    TypeChanged,

    #[strum(serialize = "A")]
    Added,

    #[strum(serialize = "D")]
    Deleted,

    #[strum(serialize = "R")]
    Renamed,

    #[strum(serialize = "C")]
    Copied,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct CommittedFileInfo {
    pub path: String,
    pub status: CommittedStatus,
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
    // TODO: could not be needed
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
pub struct StashInfo {
    pub id: String,
    pub message: Option<String>,
    pub timestamp: u32,
    pub created_on: String,
    pub changes: Option<DiffSummary>,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct FileDiff {
    pub sections: Vec<DiffSection>,
}

#[derive(borsh::BorshSerialize, Debug)]
pub struct DiffSection {
    pub diff_type: DiffType,
    pub lines: Vec<String>,
}

#[derive(borsh::BorshSerialize, Debug, Clone, PartialEq)]
pub enum DiffType {
    Added,
    Removed,
    Unchanged,
}
