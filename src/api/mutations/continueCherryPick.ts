import { IconPlayerPlay } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const continueCherryPickKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'continue_cherry_pick',
  }) as const

const continueCherryPickMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [continueCherryPickKey(repoPath)],
    mutationFn: () => {
      return invoke('continue_cherry_pick', { repoPath })
    },
    networkMode: 'always',
  })

const useContinueCherryPick = (): Action => {
  const continueCherryPick = useRepositoryMutation(continueCherryPickMutation)

  return {
    id: { key: 'cherry_pick_operation', operation: 'continue_cherry_pick' },
    blockedBy: [
      { key: 'cherry_pick_operation' },
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await continueCherryPick.mutateAsync()
    },
    label: {
      idle: 'Continue cherry-pick',
      running: 'Cherry-picking',
      success: 'Cherry-picked',
      error: 'Failed to cherry-pick',
    },
    Glyph: IconPlayerPlay,
  }
}

export {
  useContinueCherryPick,
  continueCherryPickKey,
  continueCherryPickMutation,
}
