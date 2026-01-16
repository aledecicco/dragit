import { IconArrowBackUpDouble } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const abortRebaseKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'abort_rebase',
  }) as const

const abortRebaseMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [abortRebaseKey(repoPath)],
    mutationFn: () => {
      return invoke('abort_rebase', { repoPath })
    },
    networkMode: 'always',
  })

const useAbortRebase = (): Action => {
  const abortRebase = useRepositoryMutation(abortRebaseMutation)

  return {
    id: { key: 'merge_operation', operation: 'abort_rebase' },
    blockedBy: [{ key: 'merge_operation' }],
    run: async () => {
      await abortRebase.mutateAsync()
    },
    label: {
      idle: 'Abort',
      running: 'Aborting',
      success: 'Aborted',
      error: 'Failed to abort',
    },
    Glyph: IconArrowBackUpDouble,
  }
}

export { useAbortRebase, abortRebaseKey, abortRebaseMutation }
