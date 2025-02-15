import { P, match } from 'ts-pattern'

import type { BranchInfo, BranchName, HeadInfo } from '@api/models'
import { idFn } from './types'

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

  return branchName
    ? branches.find((branch) => branch.name === branchName)
    : undefined
}

const getRemoteCounterpart = (branch: BranchInfo): BranchName | undefined => {
  return match(branch)
    .with({ type: 'local', remote: P.select() }, (remote) =>
      remote ? `${remote.remoteName}/${remote.branchName}` : undefined,
    )
    .with({ type: 'remote' }, () => undefined)
    .exhaustive()
}

export { getCurrentBranchName, getCurrentBranchInfo, getRemoteCounterpart }
