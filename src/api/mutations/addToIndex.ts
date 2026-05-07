import { IconPlaylistAdd, IconPlus } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'

import type { Action } from '@/state/actions'

import type { WorktreeFileInfo } from '../models'
import { useQueryWorktreeFiles } from '../queries/worktreeFiles'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface AddToIndexArgs {
  files: string[]
}

const addToIndexKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'add_to_index',
  }) as const

const addToIndexMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [addToIndexKey(repoPath)],
    mutationFn: (args: AddToIndexArgs) => {
      return invoke('add_to_index', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeStageFile = (): ((file: WorktreeFileInfo) => Action) => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return (file: WorktreeFileInfo): Action => ({
    id: { key: 'file_operation', operation: 'add_file', file: file.path },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Stage',
      running: 'Staging',
      success: 'Staged',
      error: 'Failed to stage',
    },
    Glyph: IconPlus,
  })
}

const useStageFile = (file: WorktreeFileInfo): Action => {
  return useMakeStageFile()(file)
}

const useStageFiles = (): Action<WorktreeFileInfo[] | string[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: { key: 'file_operation', operation: 'add_files' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await addToIndex.mutateAsync({
        files: files.map((file) =>
          typeof file === 'string' ? file : file.path,
        ),
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'add_file',
        file: typeof file === 'string' ? file : file.path,
      })),
    label: {
      idle: 'Stage files',
      running: 'Staging',
      success: 'Staged',
      error: 'Failed',
    },
    Glyph: IconPlaylistAdd,
  }
}

const useStageAll = (): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)
  const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)

  return {
    id: { key: 'file_operation', operation: 'add_all_files' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await addToIndex.mutateAsync({
        files: ['.'],
      })
    },
    derivedIds: notStagedChangesQuery.data
      ? () =>
          notStagedChangesQuery.data?.items.map((file) => ({
            key: 'file_operation',
            operation: 'add_file',
            file: file.path,
          }))
      : undefined,
    label: {
      idle: 'Stage all',
      running: 'Staging all',
      success: 'Staged all',
      error: 'Failed',
    },
    Glyph: IconPlaylistAdd,
  }
}

export {
  useMakeStageFile,
  useStageFile,
  useStageFiles,
  useStageAll,
  addToIndexKey,
  addToIndexMutation,
  type AddToIndexArgs,
}
