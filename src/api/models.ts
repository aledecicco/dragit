export type CommitId = string
export type BranchName = string

export interface CommitInfo {
  hash: CommitId
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string | null
}

export interface AncestorInfo {
  commonCommit: CommitId
  lastCommit: CommitId | undefined
  branchDistance: number
  baseDistance: number
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

interface BaseFile {
  path: string
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
