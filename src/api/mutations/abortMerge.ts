import { IconArrowBackUpDouble } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

const abortMergeKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'abort_merge',
  }) as const

const abortMergeMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [abortMergeKey(repoPath)],
    mutationFn: () => {
      return invoke('abort_merge', { repoPath })
    },
    networkMode: 'always',
  })

const useAbortMerge = (): Action => {
  const abortMerge = useRepositoryMutation(abortMergeMutation)

  return {
    id: { key: 'merge_operation', operation: 'abort_merge' },
    blockedBy: [{ key: 'merge_operation' }],
    run: async () => {
      await abortMerge.mutateAsync()
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

export { useAbortMerge, abortMergeKey, abortMergeMutation }
