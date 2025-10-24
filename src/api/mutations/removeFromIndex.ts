import { IconMinus } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { WorktreeFileInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface RemoveFromIndexArgs {
  files: string[]
}

const removeFromIndexKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'remove_from_index',
  }) as const

const removeFromIndexMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [removeFromIndexKey(repoPath)],
    mutationFn: (args: RemoveFromIndexArgs) => {
      return invoke('remove_from_index', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useUnstageFile = (file: WorktreeFileInfo): Action => {
  const unstage = useRepositoryMutation(removeFromIndexMutation)

  return {
    id: `unstage:${file.path}`,
    run: async () => {
      await unstage.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Unstage',
      running: 'Unstaging',
      success: 'Unstaged',
      error: 'Failed to unstage',
    },
    Glyph: IconMinus,
  }
}

export {
  useUnstageFile,
  removeFromIndexKey,
  removeFromIndexMutation,
  type RemoveFromIndexArgs,
}
