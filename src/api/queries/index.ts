export { HISTORY_PAGE_SIZE } from './commitHistory'
export { FILE_STATUSES_PAGE_SIZE } from './files'
export { COMMIT_FILES_PAGE_SIZE } from './commitFiles'

export { useQuerySettings } from './settings'
export { useQueryCurrentDir } from './currentDir'
export { useQueryRecentlyOpened } from './recentlyOpened'
export { useQueryHeadInfo } from './headInfo'
export { useQueryFiles } from './files'
export { useQueryCommitFiles } from './commitFiles'
export { useQueryBranches } from './branches'
export { useQueryCommitHistory } from './commitHistory'
export { useQueryCommitInfo } from './commitInfo'
export { useQueryCommonAncestor } from './commonAncestor'
export { useQueryBranchDivergence } from './branchDivergence'
export { useQueryRemotes } from './remotes'
export { useQueryStashes } from './stashes'
export { useQueryGithubProfilePicture } from './githubProfilePicture'

export { branchDivergenceQueryKeys } from './branchDivergence'
export { branchesQueryKeys } from './branches'
export { commitFilesQueryKeys } from './commitFiles'
export { commitHistoryQueryKeys } from './commitHistory'
export { commitInfoQueryKeys } from './commitInfo'
export { commonAncestorQueryKeys } from './commonAncestor'
export { currentDirQueryKey } from './currentDir'
export { filesQueryKeys } from './files'
export { headInfoQueryKeys } from './headInfo'
export { recentlyOpenedQueryKey } from './recentlyOpened'
export { remotesQueryKeys } from './remotes'
export { settingsQueryKey } from './settings'
export { stashesQueryKeys } from './stashes'

export const pathQueryKey = (path: string) =>
  ({
    path,
  }) as const
