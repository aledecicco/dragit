import type { CommitInfo } from '@/api/models'
import { useCherryPickCommit } from '@/api/mutations/cherryPick'
import { useAmend } from '@/api/mutations/commitIndex'
import {
  useMakeBranchOff,
  useMakeCreateBranchAt,
} from '@/api/mutations/createBranch'
import { useMakeMergeCommit } from '@/api/mutations/merge'
import { useRewindCommit } from '@/api/mutations/resetHead'
import { useRevertCommit } from '@/api/mutations/revertCommit'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { group, interaction } from '@/lib/ActionButton/utils'

import { useCheckoutSomeCommitInteraction } from './checkout'
import { useTagSomeCommitInteraction } from './tag'
import { useCompareCommitInteraction } from './view'

export const useCheckoutCommitInteraction = (commit: CommitInfo) => {
  const checkout = useCheckoutSomeCommitInteraction()

  return checkout(commit.shortHash)
}

export const useAmendSomeCommitInteraction = () => {
  const amend = useAmend()

  return (commit: CommitInfo) =>
    interaction({
      action: amend,
      argsRequester: () => requestCommitParams(commit.message ?? '', true),
      details: `amend commit #${commit.shortHash}`,
    })
}

export const useAmendInteraction = (commit: CommitInfo) => {
  const amendSome = useAmendSomeCommitInteraction()

  return amendSome(commit)
}

export const useCreateBranchAtCommitInteraction = (commit: CommitInfo) => {
  const createBranch = useMakeCreateBranchAt()(commit.shortHash)

  return interaction({
    action: createBranch,
    argsRequester: () => requestBranchName(`commit #${commit.shortHash}`),
    details: `create a new branch at commit #${commit.shortHash}`,
  })
}

export const useBranchOffCommitInteraction = (commit: CommitInfo) => {
  const branchOff = useMakeBranchOff()(commit.shortHash)

  return interaction({
    action: branchOff,
    argsRequester: () => requestBranchName(`commit #${commit.shortHash}`),
    details: `branch off of commit #${commit.shortHash}`,
  })
}

export const useTagCommitInteraction = (commit: CommitInfo) => {
  const tag = useTagSomeCommitInteraction()

  return tag(commit.shortHash)
}

export const useMergeSomeCommitInteraction = () => {
  const makeMerge = useMakeMergeCommit()

  return (commit: CommitInfo) =>
    interaction({
      action: makeMerge(commit.shortHash),
      details: `merge commit #${commit.shortHash} into worktree`,
    })
}

export const useMergeCommitInteraction = (commit: CommitInfo) => {
  const mergeSome = useMergeSomeCommitInteraction()

  return mergeSome(commit)
}

export const useCherryPickCommitInteraction = (commit: CommitInfo) => {
  const cherryPick = useCherryPickCommit(commit)

  return interaction({
    action: cherryPick,
    details: `cherry-pick commit #${commit.shortHash}`,
  })
}

export const useRevertCommitInteraction = (commit: CommitInfo) => {
  const revert = useRevertCommit(commit)

  return interaction({
    action: revert,
    details: `revert commit #${commit.shortHash}`,
  })
}

export const useRewindCommitInteraction = (commit: CommitInfo) => {
  const rewind = useRewindCommit(commit.shortHash)

  return interaction({
    action: rewind,
    details: `rewind worktree to before commit #${commit.shortHash}`,
  })
}

export const useSingleCommitInteractions = (commit: CommitInfo) => {
  const checkout = useCheckoutCommitInteraction(commit)
  const createBranch = useCreateBranchAtCommitInteraction(commit)
  const branchOff = useBranchOffCommitInteraction(commit)
  const tag = useTagCommitInteraction(commit)
  const merge = useMergeCommitInteraction(commit)
  const cherryPick = useCherryPickCommitInteraction(commit)
  const revert = useRevertCommitInteraction(commit)
  const rewind = useRewindCommitInteraction(commit)
  const compare = useCompareCommitInteraction(commit)

  return [
    group(tag, createBranch),
    group(checkout, branchOff),
    group(merge, cherryPick, revert, rewind),
    group(compare),
  ]
}
