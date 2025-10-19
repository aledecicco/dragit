export type ProfilePictureSource = 'github' // TODO: add more?

export interface Page<T> {
  items: T[]
  hasNext: boolean
}

export interface Settings {
  recentlyOpened: string[]
  openLastOnStart: boolean
}

export interface CurrentDirInfo {
  path: string
  isRepository: boolean
  exists: boolean
}

export type CommitId = string
export type StashId = string
export type SnapshotId = CommitId | StashId
export type BranchName = string
export type RemoteName = string
export type RemoteRef = `${RemoteName}/${BranchName}`

export interface DiffSummary {
  filesCount: number
  insertions: number
  deletions: number
}

export interface StashInfo {
  id: StashId
  stashNumber: string
  message: string | null
  timestamp: number
  createdOn: CommitId | BranchName
  changes: DiffSummary | null
}

export interface CommitInfo {
  id: CommitId
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string | null
  changes: DiffSummary | null
}

export type SnapshotInfo = CommitInfo | StashInfo

export interface AncestorInfo {
  distance: number
  hash: CommitId
}

export interface CommonAncestorInfo {
  /**
   * The last commit of the main branch before the common ancestor.
   */
  lastCommit: AncestorInfo | null

  /**
   * The first commit that two branches have in common.
   */
  commonCommit: AncestorInfo
}

export interface BranchDivergence {
  ahead: number
  behind: number
}

export interface HistoryItem {
  hash: CommitId
  otherParents: CommitId[]
}

export type ChangeStatus = 'modified' | 'typeChanged' | 'added' | 'deleted'

export type MovedStatus = 'renamed' | 'copied'

export type MergeStatus =
  | 'bothAdded'
  | 'bothDeleted'
  | 'bothModified'
  | 'addedByUs'
  | 'deletedByUs'
  | 'addedByThem'
  | 'deletedByThem'

interface BaseFileInfo {
  path: string
}

export type StagedFileInfo = BaseFileInfo & {
  status: 'staged'
} & ({ changes: ChangeStatus } | { changes: MovedStatus; oldPath: string })

export interface UnstagedFileInfo extends BaseFileInfo {
  status: 'unstaged'
  changes: ChangeStatus
}

export interface UnmergedFileInfo extends BaseFileInfo {
  status: 'unmerged'
  changes: MergeStatus
}

export interface UntrackedFileInfo extends BaseFileInfo {
  status: 'untracked'
}

export type WorktreeFileInfo =
  | StagedFileInfo
  | UnstagedFileInfo
  | UnmergedFileInfo
  | UntrackedFileInfo

export type WorktreeFileTypes = {
  staged: StagedFileInfo
  unstaged: UnstagedFileInfo
  unmerged: UnmergedFileInfo
  untracked: UntrackedFileInfo
}
export type WorktreeFileType = keyof WorktreeFileTypes

export type FileOfType<T extends WorktreeFileType> = WorktreeFileTypes[T]

export type FileTypeFilter = {
  [T in WorktreeFileType]?: boolean
}
export type VersionedFileInfo = BaseFileInfo &
  ({ changes: ChangeStatus } | { changes: MovedStatus; oldPath: string })

export interface RemoteInfo {
  name: RemoteName
  fetchUrl: string
  pushUrl: string
}

export interface Settings {
  openLastOnStart: boolean
}

export type HeadInfo =
  | { type: 'detached'; commit: CommitId }
  | { type: 'branch'; name: BranchName }

export interface LocalBranch {
  name: BranchName
  timestamp: number
  type: 'local'
  remote: {
    remoteName: RemoteName
    branchName: BranchName
  } | null
}

export interface RemoteBranch {
  name: RemoteRef
  timestamp: number
  type: 'remote'
}
export type BranchInfo = LocalBranch | RemoteBranch

export type Reference =
  | {
      type: 'commit'
      refName: CommitId
    }
  | {
      type: 'branch'
      refName: BranchName
    }

export type DiffType = 'added' | 'removed' | 'unchanged'

export type DiffLineSegment = string

export interface DiffLine {
  type: DiffType
  content: DiffLineSegment[]
}

export type FileDiff = DiffLine[]

export type MergeDiffStage = 'ours' | 'theirs'

export type CleanFileInfo = Exclude<WorktreeFileInfo, UnmergedFileInfo>

export type DiffScope =
  | { type: 'worktree'; file: CleanFileInfo }
  | { type: 'unmerged'; file: UnmergedFileInfo; stage: MergeDiffStage }
  | { type: 'snapshot'; snapshotId: SnapshotId; file: VersionedFileInfo }

export type AppMessage = {
  type: 'processStarted'
  pid: number
}

export type AppEvent =
  | { type: 'dirDisappeared'; path: string }
  | { type: 'dirChanged' }
  | { type: 'gitFolderModified'; path: string }
  | { type: 'branchesListUpdated'; path: string }
  | { type: 'branchUpdated'; path: string; name: string }
  | { type: 'headChanged'; path: string }
  | { type: 'filesModified'; path: string }
  | { type: 'configUpdated'; path: string }
  | { type: 'indexUpdated'; path: string }
  | { type: 'stashesUpdated'; path: string }
