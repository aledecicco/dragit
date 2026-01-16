import { IconPlayerPlay } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const continueRebaseKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'continue_rebase',
  }) as const

const continueRebaseMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [continueRebaseKey(repoPath)],
    mutationFn: () => {
      return invoke('continue_rebase', { repoPath })
    },
    networkMode: 'always',
  })

const useContinueRebase = (): Action => {
  const continueRebase = useRepositoryMutation(continueRebaseMutation)

  return {
    id: { key: 'merge_operation', operation: 'continue_rebase' },
    blockedBy: [
      { key: 'merge_operation' },
      { key: 'modify_branch', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await continueRebase.mutateAsync()
    },
    label: {
      idle: 'Continue',
      running: 'Rebasing',
      success: 'Rebased',
      error: 'Failed to rebase',
    },
    Glyph: IconPlayerPlay,
  }
}

export { useContinueRebase, continueRebaseKey, continueRebaseMutation }
