import { IconArrowBackUpDouble } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const abortRevertKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'abort_revert',
  }) as const

const abortRevertMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [abortRevertKey(repoPath)],
    mutationFn: () => {
      return invoke('abort_revert', { repoPath })
    },
    networkMode: 'always',
  })

const useAbortRevert = (): Action => {
  const abortRevert = useRepositoryMutation(abortRevertMutation)

  return {
    id: { key: 'revert_operation', operation: 'abort_revert' },
    blockedBy: [{ key: 'revert_operation' }],
    run: async () => {
      await abortRevert.mutateAsync()
    },
    label: {
      idle: 'Abort revert',
      running: 'Aborting revert',
      success: 'Revert aborted',
      error: 'Failed to abort revert',
    },
    Glyph: IconArrowBackUpDouble,
  }
}

export { useAbortRevert, abortRevertKey, abortRevertMutation }
