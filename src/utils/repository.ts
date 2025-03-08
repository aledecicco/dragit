import { P, match } from 'ts-pattern'

import type { BranchInfo, BranchName, HeadInfo, RefName } from '@api/models'
import { idFn, mapFn } from './types'

const getCurrentBranchName = (
  headInfo: HeadInfo | undefined,
): BranchName | undefined => {
  return match(headInfo)
    .with({ status: { type: 'initial', branch: P.select() } }, idFn)
    .with({ status: { type: 'branch', name: P.select() } }, idFn)
    .with({ status: { type: 'detached' } }, () => undefined)
    .with(undefined, () => undefined)
    .exhaustive()
}

const getCurrentBranchInfo = (
  headInfo: HeadInfo | undefined,
  branches: BranchInfo[] | undefined,
): BranchInfo | undefined => {
  if (!headInfo || !branches) {
    return undefined
  }

  const branchName = getCurrentBranchName(headInfo)

  return mapFn(branchName, (branchName) =>
    branches.find((branch) => branch.name === branchName),
  )
}

const getRemoteCounterpart = (branch: BranchInfo): RefName | undefined => {
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

export { getCurrentBranchName, getCurrentBranchInfo, getRemoteCounterpart }
