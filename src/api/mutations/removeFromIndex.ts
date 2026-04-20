import { IconMinus, IconPlaylistX } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/Staged'

import type { Action } from '@/state/actions'

import type { WorktreeFileInfo } from '../models'
import { useQueryWorktreeFiles } from '../queries/worktreeFiles'
import { pathMutationKey, useRepositoryMutation } from '../utils'

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

const useMakeUnstageFile = (): ((file: WorktreeFileInfo) => Action) => {
  const unstage = useRepositoryMutation(removeFromIndexMutation)

  return (file: WorktreeFileInfo): Action => ({
    id: { key: 'file_operation', operation: 'unstage_file', file: file.path },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
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
  })
}

const useUnstageFile = (file: WorktreeFileInfo): Action => {
  return useMakeUnstageFile()(file)
}

const useUnstageFiles = (): Action<WorktreeFileInfo[] | string[]> => {
  const removeFromIndex = useRepositoryMutation(removeFromIndexMutation)

  return {
    id: { key: 'file_operation', operation: 'unstage_files' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await removeFromIndex.mutateAsync({
        files: files.map((file) =>
          typeof file === 'string' ? file : file.path,
        ),
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'unstage_file',
        file: typeof file === 'string' ? file : file.path,
      })),
    label: {
      idle: 'Unstage files',
      running: 'Unstaging',
      success: 'Unstaged',
      error: 'Failed',
    },
    Glyph: IconPlaylistX,
  }
}

const useUnstageAll = (): Action => {
  const removeFromIndex = useRepositoryMutation(removeFromIndexMutation)
  const stagedChangesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)

  return {
    id: { key: 'file_operation', operation: 'unstage_files' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await removeFromIndex.mutateAsync({
        files: ['.'],
      })
    },
    derivedIds: stagedChangesQuery.data
      ? () =>
          stagedChangesQuery.data?.items.map((file) => ({
            key: 'file_operation',
            operation: 'unstage_file',
            file: file.path,
          }))
      : undefined,
    label: {
      idle: 'Unstage all',
      running: 'Unstaging all',
      success: 'Unstaged all',
      error: 'Failed',
    },
    Glyph: IconPlaylistX,
  }
}

export {
  useMakeUnstageFile,
  useUnstageFile,
  useUnstageFiles,
  useUnstageAll,
  removeFromIndexKey,
  removeFromIndexMutation,
  type RemoveFromIndexArgs,
}
