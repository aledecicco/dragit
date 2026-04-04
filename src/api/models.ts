export type RepositoryHost = 'github' // TODO: add more

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
export type TagName = string
export type SnapshotId = CommitId | StashId
export type BranchName = string
export type RemoteName = string
export type RemoteRef = `${RemoteName}/${BranchName}`
export interface Upstream {
  remote: RemoteName
  remoteBranch: BranchName
}

export interface DiffSummary {
  filesCount: number
  insertions: number
  deletions: number
}

export interface StashInfo {
  id: StashId
  tracker: string
  type: 'stash'
  stashNumber: string
  message: string | null
  timestamp: number
  createdOn: CommitId | BranchName
  changes: DiffSummary | null
}

export interface TagInfo {
  name: TagName
  type: 'tag'
  reference: string
  timestamp: number
  message: string | null
  authorName: string | null
  authorEmail: string | null
}

export interface CommitInfo {
  id: CommitId
  type: 'commit'
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

export interface FileInfo {
  path: string
}

export type StagedFileInfo = FileInfo & {
  status: 'staged'
} & ({ changes: ChangeStatus } | { changes: MovedStatus; oldPath: string })

export interface UnstagedFileInfo extends FileInfo {
  status: 'unstaged'
  changes: ChangeStatus
}

export interface UnmergedFileInfo extends FileInfo {
  status: 'unmerged'
  changes: MergeStatus
}

export interface UntrackedFileInfo extends FileInfo {
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

export type StagedFile = FileOfType<'staged'>
export type NotStagedFile = FileOfType<'unstaged' | 'unmerged' | 'untracked'>

export type FileTypeFilter = {
  [T in WorktreeFileType]?: boolean
}
export type VersionedFileInfo = FileInfo & { status: 'versioned' } & (
    | { changes: ChangeStatus }
    | { changes: MovedStatus; oldPath: string }
  )

export interface RemoteInfo {
  name: RemoteName
  fetchUrl: string
  pushUrl: string
}

export interface Settings {
  openLastOnStart: boolean
}

export type HeadState =
  | { type: 'detached'; commit: CommitId }
  | { type: 'branch'; name: BranchName }

export type WorktreeStatus = 'clean' | 'merging' | 'rebasing'

export type HeadInfo = {
  state: HeadState
  worktreeStatus: WorktreeStatus
}

export interface LocalBranch {
  name: BranchName
  timestamp: number
  type: 'local'
  upstream: Upstream | null
}

export interface RemoteBranch {
  name: RemoteRef
  timestamp: number
  type: 'remote'
}
export type BranchInfo = LocalBranch | RemoteBranch
export type BranchType = BranchInfo['type']

export type Reference =
  | {
      type: 'commit'
      refName: CommitId
    }
  | {
      type: 'branch'
      refName: BranchName
    }
  | {
      type: 'tag'
      refName: TagName
    }
export type RefName = Reference['refName']

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

export const conflictTypes = ['ours', 'theirs', 'unchanged'] as const
export type ConflictType = (typeof conflictTypes)[number]

export interface ConflictLine {
  type: ConflictType
  content: string
}

export type FileConflicts = ConflictLine[]

export type ResolutionStrategy = 'ours' | 'theirs'

export type AppMessage = {
  type: 'processStarted'
  pid: number
}

export type AppEvent =
  | { type: 'dirDisappeared'; repoPath: string }
  | { type: 'dirChanged' }
  | { type: 'gitFolderModified'; repoPath: string }
  | { type: 'branchesListUpdated'; repoPath: string }
  | { type: 'branchUpdated'; repoPath: string; name: string }
  | { type: 'headChanged'; repoPath: string }
  | { type: 'filesModified'; repoPath: string }
  | { type: 'configUpdated'; repoPath: string }
  | { type: 'indexUpdated'; repoPath: string }
  | { type: 'stashesUpdated'; repoPath: string }
  | { type: 'tagsUpdated'; repoPath: string }
