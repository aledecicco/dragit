import type { CommitInfo } from '@/api/models'
import { useCherryPickCommit } from '@/api/mutations/cherryPick'
import { useAmend } from '@/api/mutations/commitIndex'
import {
  useMakeBranchOff,
  useMakeCreateBranchAt,
} from '@/api/mutations/createBranch'
import { useMakeTagCommit } from '@/api/mutations/createTag'
import { useMakeMergeCommit } from '@/api/mutations/merge'
import { useRewindCommit } from '@/api/mutations/resetHead'
import { useRevertCommit } from '@/api/mutations/revertCommit'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { group, interaction } from '@/lib/ActionButton/utils'

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
  const createBranch = useMakeCreateBranchAt()(commit.id)

  return interaction({
    action: createBranch,
    argsRequester: () => requestBranchName(`commit #${commit.shortHash}`),
    details: `create a new branch at commit #${commit.shortHash}`,
  })
}

export const useBranchOffCommitInteraction = (commit: CommitInfo) => {
  const branchOff = useMakeBranchOff()(commit.id)

  return interaction({
    action: branchOff,
    argsRequester: () => requestBranchName(`commit #${commit.shortHash}`),
    details: `branch off of commit #${commit.shortHash}`,
  })
}

export const useTagCommitInteraction = (commit: CommitInfo) => {
  const tag = useMakeTagCommit()(commit.id)

  return interaction({
    action: tag,
    argsRequester: () => requestTagParams(`commit #${commit.shortHash}`),
    details: `tag commit #${commit.shortHash}`,
  })
}

export const useMergeSomeCommitInteraction = () => {
  const makeMerge = useMakeMergeCommit()

  return (commit: CommitInfo) =>
    interaction({
      action: makeMerge(commit.id),
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
  const rewind = useRewindCommit(commit.id)

  return interaction({
    action: rewind,
    details: `rewind worktree to before commit #${commit.shortHash}`,
  })
}

export const useSingleCommitInteractions = (commit: CommitInfo) => {
  const createBranch = useCreateBranchAtCommitInteraction(commit)
  const branchOff = useBranchOffCommitInteraction(commit)
  const tag = useTagCommitInteraction(commit)
  const merge = useMergeCommitInteraction(commit)
  const cherryPick = useCherryPickCommitInteraction(commit)
  const revert = useRevertCommitInteraction(commit)
  const rewind = useRewindCommitInteraction(commit)

  return [
    group(createBranch, branchOff),
    group(tag),
    group(merge, cherryPick, revert, rewind),
  ]
}
