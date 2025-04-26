import { useMemo } from 'react'
import { P, match } from 'ts-pattern'

import type { BranchInfo, Reference, RemoteRef } from '@api/models'
import { useQueryBranches, useQueryHeadInfo } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { mapFn } from './types'

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

const useCurrentRef = (): Reference | undefined => {
  const headInfo = useQueryHeadInfo()

  const currentRef = useMemo(() => {
    return match(headInfo.data)
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
  }, [headInfo.data])

  return currentRef
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

export {
  getBranchInfo,
  getRemoteCounterpart,
  useCurrentRef,
  useBranch,
  useSelectedBranches,
}
