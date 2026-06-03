import { IconArrowBackUpDouble } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const abortCherryPickKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'abort_cherry_pick',
  }) as const

const abortCherryPickMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [abortCherryPickKey(repoPath)],
    mutationFn: () => {
      return invoke('abort_cherry_pick', { repoPath })
    },
    networkMode: 'always',
  })

const useAbortCherryPick = (): Action => {
  const abortCherryPick = useRepositoryMutation(abortCherryPickMutation)

  return {
    id: { key: 'cherry_pick_operation', operation: 'abort_cherry_pick' },
    blockedBy: [{ key: 'cherry_pick_operation' }],
    run: async () => {
      await abortCherryPick.mutateAsync()
    },
    label: {
      idle: 'Abort cherry-pick',
      running: 'Aborting cherry-pick',
      success: 'Cherry-pick aborted',
      error: 'Failed to abort',
    },
    Glyph: IconArrowBackUpDouble,
  }
}

export { useAbortCherryPick, abortCherryPickKey, abortCherryPickMutation }
