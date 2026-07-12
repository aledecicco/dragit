import { IconPackage } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'

import type { Action } from '@/state/actions'

import type { WorktreeFileInfo } from '../models'
import { useQueryWorktreeFiles } from '../queries/worktreeFiles'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface SaveStashArgs {
  files: WorktreeFileInfo[] | string[]
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

type StashFileArgs = Pick<SaveStashArgs, 'message'>

const useMakeStashFile = (): ((
  file: WorktreeFileInfo,
) => Action<StashFileArgs>) => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return (file: WorktreeFileInfo): Action<StashFileArgs> => ({
    id: { key: 'file_operation', operation: 'save_stash', file: file.path },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (args) => {
      await saveStash.mutateAsync({
        files: [file.path],
        message: args.message ? args.message : null,
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

const useStashFile = (file: WorktreeFileInfo): Action<StashFileArgs> => {
  return useMakeStashFile()(file)
}

type StashFilesArgs = Pick<SaveStashArgs, 'files' | 'message'>

const useStashFiles = (): Action<StashFilesArgs> => {
  const saveStash = useRepositoryMutation(saveStashMutation)

  return {
    id: { key: 'file_operation', operation: 'save_stash' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (args) => {
      await saveStash.mutateAsync({
        files: args.files.map((file) =>
          typeof file === 'string' ? file : file.path,
        ),
        message: args.message ? args.message : null,
        includeUntracked: true,
      })
    },
    derivedIds: (args) =>
      args.files.map((file) => ({
        key: 'file_operation',
        operation: 'save_stash',
        file: typeof file === 'string' ? file : file.path,
      })),
    label: {
      idle: 'Stash files',
      running: 'Stashing',
      success: 'Stashed',
      error: 'Failed',
    },
    Glyph: IconPackage,
  }
}

const useStashAll = (): Action<Omit<StashFilesArgs, 'files'>> => {
  const saveStash = useRepositoryMutation(saveStashMutation)
  const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)

  return {
    id: { key: 'file_operation', operation: 'stash_all_files' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (args) => {
      await saveStash.mutateAsync({
        ...args,
        files: ['.'],
        includeUntracked: true,
      })
    },
    derivedIds: () => [
      ...(notStagedChangesQuery.data?.items.map((file) => ({
        key: 'file_operation',
        operation: 'save_stash',
        file: file.path,
      })) ?? []),
    ],
    label: {
      idle: 'Stash all',
      running: 'Stashing all',
      success: 'Stashed all',
      error: 'Failed',
    },
    Glyph: IconPackage,
  }
}

export {
  useMakeStashFile,
  useStashFile,
  useStashFiles,
  useStashAll,
  saveStashKey,
  saveStashMutation,
  type SaveStashArgs,
}
