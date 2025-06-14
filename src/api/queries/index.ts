export {
  branchDivergenceQueryKeys,
  useQueryBranchDivergence,
} from './branchDivergence'
export { branchesQueryKeys, useQueryBranches } from './branches'
export {
  COMMIT_FILES_PAGE_SIZE,
  commitFilesQueryKeys,
  useQueryCommitFiles,
} from './commitFiles'
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
export { FILE_STATUSES_PAGE_SIZE, filesQueryKeys, useQueryFiles } from './files'
export { headInfoQueryKeys, useQueryHeadInfo } from './headInfo'
export { useQueryProfilePicture } from './profilePicture'
export {
  recentlyOpenedQueryKey,
  useQueryRecentlyOpened,
} from './recentlyOpened'
export { remotesQueryKeys, useQueryRemotes } from './remotes'
export { settingsQueryKey, useQuerySettings } from './settings'
export { stashesQueryKeys, useQueryStashes } from './stashes'

export const pathQueryKey = (path: string) =>
  ({
    path,
  }) as const
