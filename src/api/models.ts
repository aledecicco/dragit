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
export type BranchName = string
export type RemoteName = string
export type RefName = `${RemoteName}/${BranchName}`

export interface CommitInfo {
  hash: CommitId
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string | null
}

export interface AncestorInfo {
  distance: number
  hash: CommitId
}

export interface CommonAncestorInfo {
  lastCommit: AncestorInfo | null
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
  name: RefName
  timestamp: number
  type: 'remote'
}

export type BranchInfo = LocalBranch | RemoteBranch

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

export interface ChangedFileInfo extends BaseFileInfo {
  status: 'changed'
  changes: ChangeStatus
}

export interface MovedFileInfo extends BaseFileInfo {
  status: 'moved'
  changes: MovedStatus
  old_path: string
}

export type StagedFileInfo = ChangedFileInfo | MovedFileInfo

export interface UnstagedFileInfo extends BaseFileInfo {
  changes: ChangeStatus
}

export interface UnmergedFileInfo extends BaseFileInfo {
  status: MergeStatus
}

export interface UntrackedFileInfo extends BaseFileInfo {}

export type FileInfo =
  | StagedFileInfo
  | UnstagedFileInfo
  | UnmergedFileInfo
  | UntrackedFileInfo

export interface RemoteInfo {
  name: RemoteName
  fetchUrl: string
  pushUrl: string
}

export interface DiffSummary {
  filesCount: number
  insertions: number
  deletions: number
}

export interface StashInfo {
  name: string
  message: string | null
  timestamp: number
  created_on: CommitId | BranchName
  changes: DiffSummary | null
}
