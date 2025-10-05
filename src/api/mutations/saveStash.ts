import { IconPackage } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const saveStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'stash',
  }) as const

const saveStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [saveStashKey(path)],
    mutationFn: (args: {
      files: string[]
      message: string | null
      includeUntracked: boolean
    }) => {
      return invoke('stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useSaveStash = (): Action<string[]> => {
  const saveStash = useRepositoryMutation(saveStashMutation)
  return {
    id: 'save_stash',
    run: async (files: string[]) => {
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

export { useSaveStash, saveStashKey }
