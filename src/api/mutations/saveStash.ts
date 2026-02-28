import { IconPackage } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

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

const useMakeStashFile = (): ((file: WorktreeFileInfo) => Action) => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return (file: WorktreeFileInfo): Action => ({
    id: { key: 'file_operation', operation: 'save_stash', file: file.path },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
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
      error: 'Failed to stash',
    },
    Glyph: IconPackage,
  })
}

const useStashFile = (file: WorktreeFileInfo): Action => {
  return useMakeStashFile()(file)
}

const useStashFiles = (): Action<WorktreeFileInfo[] | string[]> => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return {
    id: { key: 'file_operation', operation: 'save_stash' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await saveStash.mutateAsync({
        files: files.map((file) =>
          typeof file === 'string' ? file : file.path,
        ),
        message: null, // TODO: allow messages
        includeUntracked: true,
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'save_stash',
        file: typeof file === 'string' ? file : file.path,
      })),
    label: {
      idle: 'Stash files',
      running: 'Stashing files',
      success: 'Stashed files',
      error: 'Failed to stash',
    },
    Glyph: IconPackage,
  }
}

export {
  useMakeStashFile,
  useStashFile,
  useStashFiles,
  saveStashKey,
  saveStashMutation,
  type SaveStashArgs,
}
