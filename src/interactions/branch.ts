import { match } from 'ts-pattern'

import type { BranchInfo, CommitInfo } from '@/api/models'
import { useMakeCheckoutBranch } from '@/api/mutations/checkout'
import {
  useMakeBranchOff,
  useMakeCreateBranchAt,
  useMakeTrackBranch,
} from '@/api/mutations/createBranch'
import {
  useDeleteBranches,
  useMakeDeleteBranch,
} from '@/api/mutations/deleteBranches'
import { useMakeFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { useMakeMergeBranch } from '@/api/mutations/merge'
import {
  useMakePullBranch,
  useMakeRebaseBranch,
} from '@/api/mutations/pullBranch'
import {
  useMakeForcePushBranch,
  useMakePushBranch,
} from '@/api/mutations/pushBranch'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import type { AnyInteraction } from '@/state/actions'
import { useCurrentBranch } from '@/utils/repository'
import { pluralize } from '@/utils/string'

import { useTagSomeBranchInteraction } from './tag'
import { useCompareBranchInteraction } from './view'

export const useCheckoutBranchInteraction = (branch: BranchInfo) => {
  const checkout = useMakeCheckoutBranch()(branch)

  return interaction({ action: checkout, details: `checkout "${branch.name}"` })
}

export const useFastForwardBranchInteraction = (branch: BranchInfo) => {
  const fastForward = useMakeFastForwardBranch()

  return interaction({
    action: fastForward(branch),
    details: `fast-forward "${branch.name}"`,
  })
}

export const usePullBranchInteraction = (branch: BranchInfo) => {
  const pull = useMakePullBranch()

  return interaction({ action: pull(branch), details: `pull "${branch.name}"` })
}

export const useRebaseSomeBranchInteraction = () => {
  const rebase = useMakeRebaseBranch()

  return (branch: BranchInfo) =>
    interaction({
      action: rebase(branch),
      details: `rebase "${branch.name}"`,
    })
}

export const useRebaseBranchInteraction = (branch: BranchInfo) => {
  const rebaseSome = useRebaseSomeBranchInteraction()
  return rebaseSome(branch)
}

export const usePushSomeBranchInteraction = () => {
  const push = useMakePushBranch()

  return (branch: BranchInfo) =>
    interaction({ action: push(branch), details: `push "${branch.name}"` })
}

export const usePushBranchInteraction = (branch: BranchInfo) => {
  const pushSome = usePushSomeBranchInteraction()
  return pushSome(branch)
}

export const useForcePushBranchInteraction = (branch: BranchInfo) => {
  const forcePush = useMakeForcePushBranch()

  return interaction({
    action: forcePush(branch),
    isDangerous: true,
    details: `force push "${branch.name}"`,
  })
}

export const useCreateBranchAtSomeBranchInteraction = () => {
  const makeCreateBranchAt = useMakeCreateBranchAt()

  return (branch: BranchInfo) =>
    interaction({
      action: makeCreateBranchAt(branch.name),
      argsRequester: () => requestBranchName(branch.name),
      details: `create a new branch at "${branch.name}"`,
    })
}

export const useCreateBranchAtBranchInteraction = (branch: BranchInfo) => {
  const createBranchAtSome = useCreateBranchAtSomeBranchInteraction()

  return createBranchAtSome(branch)
}

export const useBranchOffSomeBranchInteraction = () => {
  const makeBranchOff = useMakeBranchOff()

  return (branch: BranchInfo) =>
    interaction({
      action: makeBranchOff(branch.name),
      argsRequester: () =>
        requestBranchName(
          branch.name,
          branch.type === 'remote' ? branch.name.split('/').at(-1) : undefined,
        ),
      details: `branch off of "${branch.name}"`,
    })
}

export const useBranchOffBranchInteraction = (branch: BranchInfo) => {
  const branchOffSome = useBranchOffSomeBranchInteraction()

  return branchOffSome(branch)
}

export const useTagBranchInteraction = (branch: BranchInfo) => {
  const tagSome = useTagSomeBranchInteraction()

  return tagSome(branch.name)
}

export const useMergeSomeBranchInteraction = () => {
  const makeMerge = useMakeMergeBranch()

  return (branch: BranchInfo) =>
    interaction({
      action: makeMerge(branch),
      details: `merge "${branch.name}" into worktree`,
    })
}

export const useMergeBranchInteraction = (branch: BranchInfo) => {
  const mergeSome = useMergeSomeBranchInteraction()
  return mergeSome(branch)
}

export const useTrackBranchInteraction = (branch: BranchInfo) => {
  const track = useMakeTrackBranch()(branch)

  return interaction({
    action: track,
    argsRequester: () =>
      requestBranchName(branch.name, branch.name.split('/').at(-1)),
    details: `track "${branch.name}"`,
  })
}

export const useDeleteBranchInteraction = (branch: BranchInfo) => {
  const deleteBranch = useMakeDeleteBranch()(branch)

  return interaction({
    action: deleteBranch,
    isDangerous: true,
    details: `delete branch "${branch.name}"`,
  })
}

export const useSingleBranchInteractions = (branch: BranchInfo) => {
  const isCurrentBranch = useCurrentBranch()?.name === branch.name

  const checkout = useCheckoutBranchInteraction(branch)
  const fastForward = useFastForwardBranchInteraction(branch)
  const pull = usePullBranchInteraction(branch)
  const rebase = useRebaseBranchInteraction(branch)
  const push = usePushBranchInteraction(branch)
  const forcePush = useForcePushBranchInteraction(branch)
  const createBranchAt = useCreateBranchAtBranchInteraction(branch)
  const branchOff = useBranchOffBranchInteraction(branch)
  const tag = useTagBranchInteraction(branch)
  const merge = useMergeBranchInteraction(branch)
  const track = useTrackBranchInteraction(branch)
  const deleteInteraction = useDeleteBranchInteraction(branch)
  const compare = useCompareBranchInteraction(branch)

  const forLocal1 = group(
    !isCurrentBranch && checkout,
    isCurrentBranch ? pull : fastForward,
    isCurrentBranch && [rebase, push, forcePush],
  )

  const forLocal2 = group(
    createBranchAt,
    branchOff,
    tag,
    !isCurrentBranch && merge,
  )

  const forRemote = group(track, branchOff, tag)

  const forCommon = group(compare)
  const forDelete = group(!isCurrentBranch && deleteInteraction)

  return match(branch.type)
    .with('local', () => [forLocal1, forLocal2, forCommon, forDelete])
    .with('remote', () => [forRemote, forCommon, forDelete])
    .exhaustive()
}

export const useDeleteBranchesInteraction = () => {
  const deleteBranches = useDeleteBranches()

  return (branches: BranchInfo[]) =>
    interaction({
      action: deleteBranches,
      argsRequester: () => branches,
      isDangerous: true,
      details: `delete ${pluralize('branch', branches.length, true, 'branches')}`,
    })
}

export const useCreateBranchAtSomeCommitInteraction = () => {
  const makeCreateBranchAt = useMakeCreateBranchAt()

  return (commit: CommitInfo) =>
    interaction({
      action: makeCreateBranchAt(commit.shortHash),
      argsRequester: () => requestBranchName(`#${commit.shortHash}`),
      details: `create a new branch at commit #${commit.shortHash}`,
    })
}

export const useGetBranchesListInteractions = () => {
  const deleteBranches = useDeleteBranchesInteraction()

  return (branches: BranchInfo[]): AnyInteraction[][] => [
    group(deleteBranches(branches)),
  ]
}
