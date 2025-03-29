#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct Page<T> {
    pub items: Vec<T>,
    pub has_next: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct CurrentDirInfo {
    pub path: String,
    pub is_repository: bool,
    pub exists: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct CommitInfo {
    pub hash: String,
    pub short_hash: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: u64,
    pub message: Option<String>,
}

#[derive(strum::EnumString, Debug, Clone)]
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

#[derive(serde::Serialize, strum::EnumString, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
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

#[derive(serde::Serialize, strum::EnumString, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub enum MovedStatus {
    #[strum(serialize = "R")]
    Renamed,

    #[strum(serialize = "C")]
    Copied,
}

#[derive(serde::Serialize, strum::EnumString, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
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

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"), tag = "status")]
pub enum StagedFileStatus {
    Changed {
        changes: ChangeStatus,
    },

    Moved {
        changes: MovedStatus,
        old_path: String,
    },
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct StagedFileInfo {
    pub path: String,

    #[serde(flatten)]
    pub status: StagedFileStatus,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct UnstagedFileInfo {
    pub path: String,

    pub changes: ChangeStatus,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct UnmergedFileInfo {
    pub path: String,

    pub status: MergeStatus,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct UntrackedFileInfo {
    pub path: String,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum HeadInfo {
    Detached { commit: String },
    Branch { name: String },
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct AncestorInfo {
    pub hash: String,
    pub distance: u64,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct CommonAncestorInfo {
    pub last_commit: Option<AncestorInfo>,
    pub common_commit: AncestorInfo,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct HistoryItem {
    pub hash: String,
    // TODO: could not be needed
    pub other_parents: Vec<String>,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct BranchInfo {
    pub name: String,

    pub timestamp: u64,

    #[serde(flatten)]
    pub branch_type: BranchType,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"), tag = "type")]
pub enum BranchType {
    Remote {},

    Local { remote: Option<RemoteRef> },
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct RemoteRef {
    pub remote_name: String,
    pub branch_name: String,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct BranchDivergence {
    pub ahead: u64,
    pub behind: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct RemoteInfo {
    pub name: String,
    pub fetch_url: String,
    pub push_url: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct DiffSummary {
    pub files_count: u64,
    pub insertions: u64,
    pub deletions: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct StashInfo {
    pub name: String,
    pub message: Option<String>,
    pub timestamp: u64,
    pub created_on: String,
    pub changes: Option<DiffSummary>,
}
