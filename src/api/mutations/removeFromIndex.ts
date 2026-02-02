import { IconMinus, IconPlaylistX } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { WorktreeFileInfo } from '../models'
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

const useUnstageFile = (file: WorktreeFileInfo): Action => {
  const unstage = useRepositoryMutation(removeFromIndexMutation)

  return {
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
  }
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
    label: {
      idle: 'Unstage files',
      running: 'Unstaging files',
      success: 'Unstaged files',
      error: 'Failed to unstage',
    },
    Glyph: IconPlaylistX,
  }
}

export {
  useUnstageFile,
  useUnstageFiles,
  removeFromIndexKey,
  removeFromIndexMutation,
  type RemoveFromIndexArgs,
}
