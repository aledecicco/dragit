import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { WorktreeFileInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DiscardChangesArgs {
  files: string[]
}

const discardChangesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'discard_changes',
  }) as const

const discardChangesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [discardChangesKey(repoPath)],
    mutationFn: (args: DiscardChangesArgs) => {
      return invoke('discard_changes', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeDiscardFileChanges = (): ((file: WorktreeFileInfo) => Action) => {
  const discardChanges = useRepositoryMutation(discardChangesMutation)

  return (file: WorktreeFileInfo): Action => ({
    id: {
      key: 'file_operation',
      operation: 'discard_file_changes',
      file: file.path,
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await discardChanges.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Discard',
      running: 'Discarding',
      success: 'Discarded',
      error: 'Failed to discard',
    },
    Glyph: IconTrash,
  })
}

const useDiscardFileChanges = (file: WorktreeFileInfo): Action => {
  return useMakeDiscardFileChanges()(file)
}

const useDiscardChanges = (): Action<WorktreeFileInfo[] | string[]> => {
  const discardChanges = useRepositoryMutation(discardChangesMutation)

  return {
    id: { key: 'file_operation', operation: 'discard_changes' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await discardChanges.mutateAsync({
        files: files.map((file) =>
          typeof file === 'string' ? file : file.path,
        ),
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'discard_file_changes',
        file: typeof file === 'string' ? file : file.path,
      })),
    label: {
      idle: 'Discard files',
      running: 'Discarding',
      success: 'Discarded',
      error: 'Failed to discard',
    },
    Glyph: IconTrash,
  }
}

export {
  useMakeDiscardFileChanges,
  useDiscardFileChanges,
  useDiscardChanges,
  discardChangesKey,
  discardChangesMutation,
  type DiscardChangesArgs,
}
