import { IconPlayerPlay } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

const continueMergeKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'continue_merge',
  }) as const

const continueMergeMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [continueMergeKey(repoPath)],
    mutationFn: () => {
      return invoke('continue_merge', { repoPath })
    },
    networkMode: 'always',
  })

const useContinueMerge = (): Action => {
  const continueMerge = useRepositoryMutation(continueMergeMutation)

  return {
    id: 'continue_merge',
    run: async () => {
      await continueMerge.mutateAsync()
    },
    label: {
      idle: 'Continue merge',
      running: 'Merging',
      success: 'Merged',
      error: 'Failed to merge',
    },
    Glyph: IconPlayerPlay,
  }
}

export { useContinueMerge, continueMergeKey, continueMergeMutation }
