import { IconPlayerPlay } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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
    id: 'continue_rebase',
    run: async () => {
      await continueRebase.mutateAsync()
    },
    label: {
      idle: 'Continue rebase',
      running: 'Rebasing',
      success: 'Rebased',
      error: 'Failed to rebase',
    },
    Glyph: IconPlayerPlay,
  }
}

export { useContinueRebase, continueRebaseKey, continueRebaseMutation }
