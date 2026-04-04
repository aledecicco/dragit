import { match } from 'ts-pattern'

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
import { useSelectedBase } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'

/**
 * Finds a branch's info by name in a list of available branches.
 *
 * @param refName - The name to search for.
 * @param branches - The list of branches to search in.
 */
const findBranchInfo = (
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
const useBranch = (
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
const useHeadReference = (): Reference | undefined => {
  const headInfoQuery = useQueryHeadInfo()

  const currentRef = match(headInfoQuery.data?.state)
    .returnType<Reference | undefined>()
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
const useCurrentBranch = (): BranchInfo | undefined => {
  const currentReference = useHeadReference()
  const branch = useBranch(currentReference)

  return branch
}

/**
 * Hook that tracks the currently selected base branch, if any.
 */
const useCurrentBaseBranch = (): BranchInfo | undefined => {
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
const findRemoteInfo = (
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
const useRemote = (
  remoteName: RemoteName | undefined,
): RemoteInfo | undefined => {
  const remotesQuery = useQueryRemotes()

  const remote =
    remoteName && remotesQuery.data?.length
      ? findRemoteInfo(remoteName, remotesQuery.data)
      : undefined

  return remote
}

const useRepositoryHost = (): RepositoryHost | undefined => {
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
const getUpstreamReference = (upstream: Upstream): Reference => ({
  type: 'branch',
  refName: `${upstream.remote}/${upstream.remoteBranch}`,
})

export {
  findBranchInfo,
  useBranch,
  useHeadReference,
  useCurrentBranch,
  useCurrentBaseBranch,
  findRemoteInfo,
  useRemote,
  useRepositoryHost,
  getUpstreamReference,
}
