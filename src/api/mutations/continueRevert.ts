import { IconPlayerPlay } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const continueRevertKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'continue_revert',
  }) as const

const continueRevertMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [continueRevertKey(repoPath)],
    mutationFn: () => {
      return invoke('continue_revert', { repoPath })
    },
    networkMode: 'always',
  })

const useContinueRevert = (): Action => {
  const continueRevert = useRepositoryMutation(continueRevertMutation)

  return {
    id: { key: 'revert_operation', operation: 'continue_revert' },
    blockedBy: [
      { key: 'revert_operation' },
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await continueRevert.mutateAsync()
    },
    label: {
      idle: 'Continue revert',
      running: 'Reverting',
      success: 'Reverted',
      error: 'Failed to revert',
    },
    Glyph: IconPlayerPlay,
  }
}

export { useContinueRevert, continueRevertKey, continueRevertMutation }
