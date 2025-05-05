import { useMemo } from 'react'
import { P, match } from 'ts-pattern'

import type {
  BranchInfo,
  Reference,
  RemoteBranch,
  RemoteInfo,
  RemoteName,
  RemoteRef,
} from '@api/models'
import { useQueryBranches, useQueryRemotes } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { mapFn } from './types'

export const DEFAULT_REMOTE_NAME = 'origin'

const getBranchInfo = (
  refName: string,
  branches: BranchInfo[],
): BranchInfo | undefined => {
  return branches.find((branch) => branch.name === refName)
}

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

const useBranch = (
  reference: Reference | undefined,
): BranchInfo | undefined => {
  const branchesQuery = useQueryBranches()

  const branch = useMemo(() => {
    if (!reference || !branchesQuery.data?.length) {
      return undefined
    }

    return getBranchInfo(reference.refName, branchesQuery.data)
  }, [branchesQuery.data, reference])

  return branch
}

const useTrackedBranch = (
  branch: BranchInfo | undefined,
): RemoteBranch | undefined => {
  const branchesQuery = useQueryBranches()

  const trackedBranch = useMemo(() => {
    if (!branch || !branchesQuery.data?.length) {
      return undefined
    }

    const remoteRef = getRemoteCounterpart(branch)

    if (!remoteRef) {
      return undefined
    }

    return branchesQuery.data
      .filter((branch) => branch.type === 'remote')
      .find((branch) => branch.name === remoteRef)
  }, [branchesQuery.data, branch])

  return trackedBranch
}

const useSelectedBranches = () => {
  const { reference, baseReference } = useSelectedRefs()
  const branch = useBranch(reference)
  const baseBranch = useBranch(baseReference)

  return useMemo(
    () => ({
      branch,
      baseBranch,
    }),
    [branch, baseBranch],
  )
}

const getRemoteInfo = (
  remoteName: string,
  remotes: RemoteInfo[],
): RemoteInfo | undefined => {
  return remotes.find((remote) => remote.name === remoteName)
}

const useRemote = (remoteName: RemoteName | undefined) => {
  const remotesQuery = useQueryRemotes()

  const remote = useMemo(() => {
    if (!remoteName || !remotesQuery.data?.length) {
      return undefined
    }

    return getRemoteInfo(remoteName, remotesQuery.data)
  }, [remotesQuery.data, remoteName])

  return remote
}

const useCurrentRemote = () => {
  const { branch } = useSelectedBranches()

  const remote = useRemote(
    branch?.type === 'local' ? branch.remote?.remoteName : undefined,
  )

  return remote
}

export {
  getBranchInfo,
  getRemoteCounterpart,
  useTrackedBranch,
  useBranch,
  useSelectedBranches,
  getRemoteInfo,
  useRemote,
  useCurrentRemote,
}
