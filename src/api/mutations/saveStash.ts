import { IconPackage } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface SaveStashArgs {
  files: string[]
  message: string | null
  includeUntracked: boolean
}

const saveStashKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'stash',
  }) as const

const saveStashMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [saveStashKey(repoPath)],
    mutationFn: (args: SaveStashArgs) => {
      return invoke('stash', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useSaveStash = (): Action<string[]> => {
  const saveStash = useRepositoryMutation(saveStashMutation)
  return {
    id: 'save_stash',
    run: async (files) => {
      await saveStash.mutateAsync({
        files,
        message: null, // TODO: allow messages
        includeUntracked: true,
      })
    },
    label: {
      idle: 'Stash',
      running: 'Stashing',
      success: 'Stashed',
      error: 'Failed',
    },
    Glyph: IconPackage,
  }
}

export { useSaveStash, saveStashKey, saveStashMutation, type SaveStashArgs }
