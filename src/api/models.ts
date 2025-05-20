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
export type RemoteRef = `${RemoteName}/${BranchName}`

export interface CommitInfo {
  hash: CommitId
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string | null
  changes: DiffSummary | null
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

export type StagedFileInfo = {
  status: 'staged'
} & BaseFileInfo &
  ({ changes: ChangeStatus } | { changes: MovedStatus; oldPath: string })

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

export type FileInfo =
  | StagedFileInfo
  | UnstagedFileInfo
  | UnmergedFileInfo
  | UntrackedFileInfo

export type FileTypes = {
  staged: StagedFileInfo
  unstaged: UnstagedFileInfo
  unmerged: UnmergedFileInfo
  untracked: UntrackedFileInfo
}
export type FileType = keyof FileTypes

export type FileOfType<T extends FileType> = FileTypes[T]

export type FileTypeFilter = {
  [T in FileType]?: boolean
}

export type CommitedFileStatus =
  | 'modified'
  | 'typeChanged'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'copied'

export interface CommitedFileInfo {
  path: string
  status: CommitedFileStatus
}

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
  id: string
  message: string | null
  timestamp: number
  createdOn: CommitId | BranchName
  changes: DiffSummary | null
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
