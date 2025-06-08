import { P, match } from 'ts-pattern'

import type {
  BranchInfo,
  Reference,
  RemoteInfo,
  RemoteName,
  RemoteRef,
} from '@api/models'
import { useQueryBranches, useQueryRemotes } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { mapFn } from './types'

export const DEFAULT_REMOTE_NAME = 'origin'

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
 * @returns The remote counterpart of a local branch, if any.
 */
const getRemoteCounterpart = (branch: BranchInfo): RemoteRef | undefined => {
  return match(branch)
    .with({ type: 'local', remote: P.select() }, (remote) =>
      mapFn(
        remote,
        (remote) => `${remote.remoteName}/${remote.branchName}` as const,
      ),
    )
    .with({ type: 'remote' }, () => undefined)
    .exhaustive()
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
 * Listens to the currently selected reference and base reference,
 * and evaluates them to branches if possible.
 *
 * @returns An object containing:
 * - `branch`: The branch pointed at by the selected reference, if any.
 * - `baseBranch`: The branch pointed at by the base reference, if any.
 */
const useSelectedBranches = () => {
  const { reference, baseReference } = useSelectedRefs()
  const branch = useBranch(reference)
  const baseBranch = useBranch(baseReference)

  return {
    branch,
    baseBranch,
  }
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

export {
  findBranchInfo,
  getRemoteCounterpart,
  useBranch,
  useSelectedBranches,
  findRemoteInfo,
  useRemote,
}
