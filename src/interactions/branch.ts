import { match } from 'ts-pattern'

import type { BranchInfo, BranchName, CommitId } from '@/api/models'
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
import { useBranchResolver, useCurrentBranch } from '@/utils/repository'
import { pluralize } from '@/utils/string'

import { useTagSomeBranchInteraction } from './tag'
import { compareBranchInteraction } from './view'

export const useCheckoutBranchInteraction = (branch: BranchName) => {
  const checkout = useMakeCheckoutBranch()(branch)

  return interaction({ action: checkout, details: `checkout "${branch}"` })
}

export const useFastForwardBranchInteraction = (branch: BranchName) => {
  const fastForward = useMakeFastForwardBranch()

  return interaction({
    action: fastForward(branch),
    details: `fast-forward "${branch}"`,
  })
}

export const usePullBranchInteraction = (branch: BranchName) => {
  const pull = useMakePullBranch()

  return interaction({ action: pull(branch), details: `pull "${branch}"` })
}

export const useRebaseSomeBranchInteraction = () => {
  const rebase = useMakeRebaseBranch()

  return (branch: BranchName) =>
    interaction({
      action: rebase(branch),
      details: `rebase "${branch}"`,
    })
}

export const useRebaseBranchInteraction = (branch: BranchName) => {
  const rebaseSome = useRebaseSomeBranchInteraction()

  return rebaseSome(branch)
}

export const usePushSomeBranchInteraction = () => {
  const push = useMakePushBranch()

  return (branch: BranchName) =>
    interaction({ action: push(branch), details: `push "${branch}"` })
}

export const usePushBranchInteraction = (branch: BranchName) => {
  const pushSome = usePushSomeBranchInteraction()

  return pushSome(branch)
}

export const useForcePushBranchInteraction = (branch: BranchName) => {
  const forcePush = useMakeForcePushBranch()

  return interaction({
    action: forcePush(branch),
    isDangerous: true,
    details: `force push "${branch}"`,
  })
}

export const useCreateBranchAtSomeBranchInteraction = () => {
  const makeCreateBranchAt = useMakeCreateBranchAt()

  return (branch: BranchName) =>
    interaction({
      action: makeCreateBranchAt(branch),
      argsRequester: () => requestBranchName(branch),
      details: `create a new branch at "${branch}"`,
    })
}

export const useCreateBranchAtBranchInteraction = (branch: BranchName) => {
  const createBranchAtSome = useCreateBranchAtSomeBranchInteraction()

  return createBranchAtSome(branch)
}

export const useBranchOffSomeBranchInteraction = () => {
  const makeBranchOff = useMakeBranchOff()
  const resolveBranch = useBranchResolver()

  return (branch: BranchName) =>
    interaction({
      action: makeBranchOff(branch),
      argsRequester: () =>
        requestBranchName(
          branch,
          resolveBranch(branch)?.type === 'remote'
            ? branch.split('/').at(-1)
            : undefined,
        ),
      details: `branch off of "${branch}"`,
    })
}

export const useBranchOffBranchInteraction = (branch: BranchName) => {
  const branchOffSome = useBranchOffSomeBranchInteraction()

  return branchOffSome(branch)
}

export const useTagBranchInteraction = (branch: BranchName) => {
  const tagSome = useTagSomeBranchInteraction()

  return tagSome(branch)
}

export const useMergeSomeBranchInteraction = () => {
  const makeMerge = useMakeMergeBranch()

  return (branch: BranchName) =>
    interaction({
      action: makeMerge(branch),
      details: `merge "${branch}" into worktree`,
    })
}

export const useMergeBranchInteraction = (branch: BranchName) => {
  const mergeSome = useMergeSomeBranchInteraction()

  return mergeSome(branch)
}

export const useTrackBranchInteraction = (branch: BranchName) => {
  const track = useMakeTrackBranch()(branch)

  return interaction({
    action: track,
    argsRequester: () => requestBranchName(branch, branch.split('/').at(-1)),
    details: `track "${branch}"`,
  })
}

export const useDeleteBranchInteraction = (branch: BranchName) => {
  const deleteBranch = useMakeDeleteBranch()(branch)

  return interaction({
    action: deleteBranch,
    isDangerous: true,
    details: `delete branch "${branch}"`,
  })
}

export const useSingleBranchInteractions = (branch: BranchInfo) => {
  const isCurrentBranch = useCurrentBranch()?.name === branch.name

  const checkout = useCheckoutBranchInteraction(branch.name)
  const fastForward = useFastForwardBranchInteraction(branch.name)
  const pull = usePullBranchInteraction(branch.name)
  const rebase = useRebaseBranchInteraction(branch.name)
  const push = usePushBranchInteraction(branch.name)
  const forcePush = useForcePushBranchInteraction(branch.name)
  const createBranchAt = useCreateBranchAtBranchInteraction(branch.name)
  const branchOff = useBranchOffBranchInteraction(branch.name)
  const tag = useTagBranchInteraction(branch.name)
  const merge = useMergeBranchInteraction(branch.name)
  const track = useTrackBranchInteraction(branch.name)
  const deleteInteraction = useDeleteBranchInteraction(branch.name)
  const compare = compareBranchInteraction(branch.name)

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

  return (branches: BranchName[]) =>
    interaction({
      action: deleteBranches,
      argsRequester: () => branches,
      isDangerous: true,
      details: `delete ${pluralize('branch', branches.length, true, 'branches')}`,
    })
}

export const useCreateBranchAtSomeCommitInteraction = () => {
  const makeCreateBranchAt = useMakeCreateBranchAt()

  return (commit: CommitId) =>
    interaction({
      action: makeCreateBranchAt(commit),
      argsRequester: () => requestBranchName(`#${commit}`),
      details: `create a new branch at commit #${commit}`,
    })
}

export const useGetBranchesListInteractions = () => {
  const deleteBranches = useDeleteBranchesInteraction()

  return (branches: BranchInfo[]) => [
    group(deleteBranches(branches.map((branch) => branch.name))),
  ]
}
