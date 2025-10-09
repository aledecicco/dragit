export {
  branchDivergenceQueryKeys,
  useQueryBranchDivergence,
} from './branchDivergence'
export { branchesQueryKeys, useQueryBranches } from './branches'
export {
  commitHistoryQueryKeys,
  HISTORY_PAGE_SIZE,
  useQueryCommitHistory,
} from './commitHistory'
export { commitInfoQueryKeys, useQueryCommitInfo } from './commitInfo'
export {
  commonAncestorQueryKeys,
  useQueryCommonAncestor,
} from './commonAncestor'
export { currentDirQueryKey, useQueryCurrentDir } from './currentDir'
export { headInfoQueryKeys, useQueryHeadInfo } from './headInfo'
export { useQueryProfilePicture } from './profilePicture'
export {
  recentlyOpenedQueryKey,
  useQueryRecentlyOpened,
} from './recentlyOpened'
export { remotesQueryKeys, useQueryRemotes } from './remotes'
export { settingsQueryKey, useQuerySettings } from './settings'
export {
  SNAPSHOT_FILES_PAGE_SIZE,
  snapshotFilesQueryKeys,
  useQuerySnapshotFiles,
} from './snapshotFiles'
export { stashesQueryKeys, useQueryStashes } from './stashes'
export {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
  worktreeFilesQueryKeys,
} from './worktreeFiles'

export const pathQueryKey = (path: string) =>
  ({
    path,
  }) as const
