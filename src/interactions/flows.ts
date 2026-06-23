import type { CommitIndexArgs } from '@/api/mutations/commitIndex'
import type { SaveStashArgs } from '@/api/mutations/saveStash'
import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { useQueryCommitInfo } from '@/api/queries/commitInfo'
import { requestCommitParams } from '@/common/CommitDialog'
import { type Interaction, triggerInteraction } from '@/state/actions'
import { useCurrentBranch, useHeadReference } from '@/utils/repository'

import {
  usePushSomeBranchInteraction,
  useRebaseSomeBranchInteraction,
} from './branch'
import { useAmendSomeCommitInteraction } from './commit'
import { useStageAllInteraction } from './file'
import { useCommitInteraction } from './operations'
import { useStashAllInteraction } from './stash'

export interface Flow {
  id: string
  key: string
  label: string
  description: string
  execute: () => Promise<void>
}

export const useQuickCommitFlow = (): Flow => {
  const stageAll = useStageAllInteraction()
  const commit = useCommitInteraction()

  return {
    id: 'quick-commit',
    key: 'c',
    label: 'Quick Commit',
    description: 'Stage and commit all changes',
    execute: async () => {
      const params = await requestCommitParams()
      await triggerInteraction(stageAll)
      await triggerInteraction({
        ...commit,
        argsRequester: () => params,
      } as Interaction<CommitIndexArgs>)
    },
  }
}

export const useQuickStashFlow = (): Flow => {
  const stashAll = useStashAllInteraction()

  return {
    id: 'quick-stash',
    key: 's',
    label: 'Quick Stash',
    description: 'Stash all changes',
    execute: async () => {
      await triggerInteraction({
        ...stashAll,
        argsRequester: async () => ({
          message: null,
        }),
      } as Interaction<SaveStashArgs>)
    },
  }
}

export const useQuickBranchUpdateFlow = (): Flow => {
  const currentBranch = useCurrentBranch()
  const rebaseSome = useRebaseSomeBranchInteraction()
  const pushSome = usePushSomeBranchInteraction()

  return {
    id: 'quick-branch-update',
    key: 'u',
    label: 'Quick Branch Update',
    description: 'Update branch from remote and push local changes',
    execute: async () => {
      if (!currentBranch) {
        throw new Error('No branch currently selected')
      }

      await triggerInteraction(rebaseSome(currentBranch))
      await triggerInteraction(pushSome(currentBranch))
    },
  }
}

export const useQuickAmendFlow = (): Flow => {
  const currentReference = useHeadReference()
  const historyQuery = useQueryCommitHistory(currentReference?.refName)
  const lastCommit = historyQuery.data?.pages.at(0)?.items.at(0)?.hash
  const commitInfo = useQueryCommitInfo(lastCommit).data

  const stageAll = useStageAllInteraction()
  const amendSome = useAmendSomeCommitInteraction()

  return {
    id: 'amend',
    key: 'm',
    label: 'Quick Amend',
    description: 'Add current changes to the last commit',
    execute: async () => {
      if (!commitInfo) {
        throw new Error('No commit info found')
      }

      await triggerInteraction(stageAll)

      await triggerInteraction({
        ...amendSome(commitInfo),
        argsRequester: () => ({
          message: commitInfo.message,
          isAmend: true,
        }),
      } as Interaction<CommitIndexArgs>)
    },
  }
}
