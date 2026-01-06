import { IconPackage } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { WorktreeFileInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

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

const useStashFile = (file: WorktreeFileInfo): Action => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return {
    id: { key: 'file_operation', operation: 'save_stash', file: file.path },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'modify_branch', type: 'current' },
    ],
    run: async () => {
      await saveStash.mutateAsync({
        files: [file.path],
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

const useSaveStash = (): Action<string[] | string> => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return {
    id: { key: 'file_operation', operation: 'save_stash' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'modify_branch', type: 'current' },
    ],
    run: async (files) => {
      await saveStash.mutateAsync({
        files: Array.isArray(files) ? files : [files],
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

export {
  useStashFile,
  useSaveStash,
  saveStashKey,
  saveStashMutation,
  type SaveStashArgs,
}
