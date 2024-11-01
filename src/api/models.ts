export type CommitInfo = {
  hash: string
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string | null
}

export type HeadInfo = {
  status: HeadStatus
  files: FileInfo[]
}

export type HeadStatus =
  | { type: 'initial'; branch: string }
  | { type: 'detached'; commit: string }
  | { type: 'branch'; name: string }

export type FileInfo = {
  path: string
  status: FileStatus
}

export type FileStatus =
  | { type: 'modified'; staged: ChangeStatus; unstaged: ChangeStatus }
  | {
      type: 'renamed'
      from: string
      status: MovedStatus
      unstaged: ChangeStatus
    }
  | { type: 'unmerged'; status: MergeStatus }
  | { type: 'untracked' }

export type ChangeStatus =
  | 'unmodified'
  | 'modified'
  | 'typeChanged'
  | 'added'
  | 'deleted'

export type MovedStatus = 'renamed' | 'copied'

export type MergeStatus =
  | 'bothAdded'
  | 'bothDeleted'
  | 'bothModified'
  | 'addedByUs'
  | 'deletedByUs'
  | 'addedByThem'
  | 'deletedByThem'
