import type { Infer } from 'borsher'

import type {
  ANCESTOR_INFO_SCHEMA,
  BRANCH_DIVERGENCE_SCHEMA,
  BRANCH_INFO_SCHEMA,
  COMMIT_INFO_SCHEMA,
  COMMON_ANCESTOR_INFO_SCHEMA,
  CURRENT_DIR_INFO_SCHEMA,
  DIFF_SUMMARY_SCHEMA,
  HEAD_INFO_SCHEMA,
  HISTORY_ITEM_SCHEMA,
  PAGE_SCHEMA,
  REMOTE_INFO_SCHEMA,
  STAGED_FILE_INFO_SCHEMA,
  STASH_INFO_SCHEMA,
  UNMERGED_FILE_INFO_SCHEMA,
  UNSTAGED_FILE_INFO_SCHEMA,
  UNTRACKED_FILE_INFO_SCHEMA,
} from './schemas'

export interface Settings {
  recentlyOpened: string[]
  openLastOnStart: boolean
}

export type Page<T> = Infer<ReturnType<typeof PAGE_SCHEMA<T>>>

export type CurrentDirInfo = NonNullable<Infer<typeof CURRENT_DIR_INFO_SCHEMA>>

export type CommitId = string
export type BranchName = string
export type RemoteName = string
export type RefName = `${RemoteName}/${BranchName}`

export type CommitInfo = Infer<typeof COMMIT_INFO_SCHEMA>

export type AncestorInfo = Infer<typeof ANCESTOR_INFO_SCHEMA>

export type CommonAncestorInfo = Infer<typeof COMMON_ANCESTOR_INFO_SCHEMA>

export type BranchDivergence = Infer<typeof BRANCH_DIVERGENCE_SCHEMA>

export type HistoryItem = Infer<typeof HISTORY_ITEM_SCHEMA>

export type HeadInfo = Infer<typeof HEAD_INFO_SCHEMA>

export type BranchInfo = Infer<typeof BRANCH_INFO_SCHEMA>

export type StagedFileInfo = Infer<typeof STAGED_FILE_INFO_SCHEMA>
export type UnstagedFileInfo = Infer<typeof UNSTAGED_FILE_INFO_SCHEMA>
export type UnmergedFileInfo = Infer<typeof UNMERGED_FILE_INFO_SCHEMA>
export type UntrackedFileInfo = Infer<typeof UNTRACKED_FILE_INFO_SCHEMA>

export type FileTypes = {
  staged: StagedFileInfo
  unstaged: UnstagedFileInfo
  unmerged: UnmergedFileInfo
  untracked: UntrackedFileInfo
}
export type FileType = keyof FileTypes

export type RemoteInfo = Infer<typeof REMOTE_INFO_SCHEMA>

export type DiffSummary = Infer<typeof DIFF_SUMMARY_SCHEMA>

export type StashInfo = Infer<typeof STASH_INFO_SCHEMA>

export type AppMessage = {
  type: 'processStarted'
  pid: number
  subprocess: number | null
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
