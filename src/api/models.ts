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

export interface HeadInfo {
  status: HeadStatus
  files: FileInfo[]
}

export type HeadStatus =
  | { type: 'initial'; branch: BranchName }
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

interface BaseFile {
  path: string
  isDir: boolean
}

export interface StagedOnlyFile extends BaseFile {
  status: 'modified'
  staged: Exclude<ChangeStatus, 'unmodified'>
  unstaged: Extract<ChangeStatus, 'unmodified'>
}

export interface UnstagedOnlyFile extends BaseFile {
  status: 'modified'
  staged: Extract<ChangeStatus, 'unmodified'>
  unstaged: Exclude<ChangeStatus, 'unmodified'>
}

export interface StagedAndUnstagedFile extends BaseFile {
  status: 'modified'
  staged: Exclude<ChangeStatus, 'unmodified'>
  unstaged: Exclude<ChangeStatus, 'unmodified'>
}

export type ModifiedFile =
  | StagedOnlyFile
  | UnstagedOnlyFile
  | StagedAndUnstagedFile

export interface MovedOnlyFile extends BaseFile {
  status: 'moved'
  from: string
  staged: MovedStatus
  unstaged: Extract<ChangeStatus, 'unmodified'>
}

export interface MovedAndModifiedFile extends BaseFile {
  status: 'moved'
  from: string
  staged: MovedStatus
  unstaged: Exclude<ChangeStatus, 'unmodified'>
}

export type MovedFile = MovedOnlyFile | MovedAndModifiedFile

export type StagedFile = Exclude<ModifiedFile, UnstagedOnlyFile> | MovedFile

export type UnstagedFile =
  | Exclude<ModifiedFile, StagedOnlyFile>
  | MovedAndModifiedFile

export interface UnmergedFile extends BaseFile {
  status: 'unmerged'
  unstaged: MergeStatus
}

export interface UntrackedFile extends BaseFile {
  status: 'untracked'
}

export type FileInfo = ModifiedFile | MovedFile | UnmergedFile | UntrackedFile

export type ChangeStatus =
  | 'unmodified'
  | 'modified'
  | 'typeChanged'
  | 'added'
  | 'deleted'

export type MovedStatus = 'renamed' | 'copied'

export type ModifiedStatus = ChangeStatus | MovedStatus

export type MergeStatus =
  | 'bothAdded'
  | 'bothDeleted'
  | 'bothModified'
  | 'addedByUs'
  | 'deletedByUs'
  | 'addedByThem'
  | 'deletedByThem'

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
