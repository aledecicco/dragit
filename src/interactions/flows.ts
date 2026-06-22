import type { CommitIndexArgs } from '@/api/mutations/commitIndex'
import type { SaveStashArgs } from '@/api/mutations/saveStash'
import { requestCommitParams } from '@/common/CommitDialog'
import { type Interaction, triggerInteraction } from '@/state/actions'

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
