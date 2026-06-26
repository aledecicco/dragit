import { match } from 'ts-pattern'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/Staged'

import type {
  BranchInfo,
  Reference,
  RemoteInfo,
  RemoteName,
  RepositoryHost,
  Upstream,
} from '@/api/models'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { useQueryRemotes } from '@/api/queries/remotes'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useSelectedBase } from '@/state/branches'
import { useWorktreeFilesPage } from '@/state/pages'
import { useSelectedUpstream } from '@/state/upstream'

/**
 * Finds a branch's info by name in a list of available branches.
 *
 * @param refName - The name to search for.
 * @param branches - The list of branches to search in.
 */
export const findBranchInfo = (
  refName: string,
  branches: BranchInfo[],
): BranchInfo | undefined => {
  return branches.find((branch) => branch.name === refName)
}

/**
 * Hook that tracks a branch by name.
 *
 * @param reference - The branch to track.
 *
 * @returns A stable reference to the branch's info if found.
 */
export const useBranch = (
  reference: Reference | undefined,
): BranchInfo | undefined => {
  const branchesQuery = useQueryBranches()

  const branch =
    reference && branchesQuery.data?.length
      ? findBranchInfo(reference.refName, branchesQuery.data)
      : undefined

  return branch
}

/**
 * Hook that tracks the currently checked out reference.
 */
export const useHeadReference = ():
  | Exclude<Reference, { type: 'tag' }>
  | undefined => {
  const headInfoQuery = useQueryHeadInfo()

  const currentRef = match(headInfoQuery.data?.state)
    .returnType<Exclude<Reference, { type: 'tag' }> | undefined>()
    .with({ type: 'branch' }, (reference) => ({
      type: 'branch',
      refName: reference.name,
    }))
    .with({ type: 'detached' }, (reference) => ({
      type: 'commit',
      refName: reference.commit,
    }))
    .with(undefined, () => undefined)
    .exhaustive()

  return currentRef
}

/**
 * Hook that tracks the currently checked out branch, if any.
 */
export const useCurrentBranch = (): BranchInfo | undefined => {
  const currentReference = useHeadReference()
  const branch = useBranch(currentReference)

  return branch
}

/**
 * Hook that tracks the currently selected base branch, if any.
 */
export const useCurrentBaseBranch = (): BranchInfo | undefined => {
  const currentReference = useHeadReference()
  const baseBranch = useBranch(useSelectedBase(currentReference))

  return baseBranch
}

/**
 * Finds a remote's info by name in a list of available remotes.
 *
 * @param remoteName - The name to search for.
 * @param remotes - The list of remotes to search in.
 */
export const findRemoteInfo = (
  remoteName: string,
  remotes: RemoteInfo[],
): RemoteInfo | undefined => {
  return remotes.find((remote) => remote.name === remoteName)
}

/**
 * Hook that tracks a remote by name.
 *
 * @param remoteName - The remote to track.
 *
 * @returns A stable reference to the remote's info if found.
 */
export const useRemote = (
  remoteName: RemoteName | undefined,
): RemoteInfo | undefined => {
  const remotesQuery = useQueryRemotes()

  const remote =
    remoteName && remotesQuery.data?.length
      ? findRemoteInfo(remoteName, remotesQuery.data)
      : undefined

  return remote
}

/**
 * Hook that tracks where the current repository is hosted in.
 */
export const useRepositoryHost = (): RepositoryHost | undefined => {
  const currentBranch = useCurrentBranch()
  const upstream = useSelectedUpstream(currentBranch)
  const remote = useRemote(upstream?.remote)

  if (!remote) {
    return undefined
  }

  if (remote.fetchUrl.includes('github.com')) {
    return 'github'
  }

  return undefined
}

/**
 * Get the reference an upstream points to.
 */
export const getUpstreamReference = (upstream: Upstream): Reference => ({
  type: 'branch',
  refName: `${upstream.remote}/${upstream.remoteBranch}`,
})

/**
 * Hook that tracks whether there are any staged changes in the worktree.
 */
export const useHasStagedChanges = () => {
  const stagedPage = useWorktreeFilesPage(STAGED_FILE_TYPES)
  const stagedChangesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)

  return stagedPage > 0 || !!stagedChangesQuery.data?.items.length
}

/**
 * Hook that tracks the number of staged changes in the worktree.
 */
export const useStagedCount = () => {
  const stagedPage = useWorktreeFilesPage(STAGED_FILE_TYPES)
  const stagedChangesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)
  const stagedCount =
    stagedPage * WORKTREE_FILES_PAGE_SIZE +
    (stagedChangesQuery.data?.items.length ?? 0)

  return {
    count: stagedCount,
    hasMore: stagedChangesQuery.data?.hasNext || stagedChangesQuery.isFetching,
  }
}

/**
 * Hook that tracks whether there are any not staged changes in the worktree.
 */
export const useHasNotStagedChanges = () => {
  const notStagedPage = useWorktreeFilesPage(NOT_STAGED_FILE_TYPES)
  const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)

  return notStagedPage > 0 || !!notStagedChangesQuery.data?.items.length
}

/**
 * Hook that tracks the number of not staged changes in the worktree.
 */
export const useNotStagedCount = () => {
  const notStagedPage = useWorktreeFilesPage(NOT_STAGED_FILE_TYPES)
  const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)
  const notStagedCount =
    notStagedPage * WORKTREE_FILES_PAGE_SIZE +
    (notStagedChangesQuery.data?.items.length ?? 0)

  return {
    count: notStagedCount,
    hasMore:
      notStagedChangesQuery.data?.hasNext || notStagedChangesQuery.isFetching,
  }
}
