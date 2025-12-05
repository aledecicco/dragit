import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { WorktreeFileInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface RemoveFromTreeArgs {
  files: string[]
}

const removeFromTreeKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'remove_from_tree',
  }) as const

const removeFromTreeMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [removeFromTreeKey(repoPath)],
    mutationFn: (args: RemoveFromTreeArgs) => {
      return invoke('remove_from_tree', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMarkAsRemoved = (file: WorktreeFileInfo): Action => {
  const remove = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: { key: 'file_operation', operation: 'remove_file', file: file.path },
    blockedBy: [{ key: 'file_operation' }],
    run: async () => {
      await remove.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Delete',
      running: 'Deleting',
      success: 'Deleted',
      error: 'Failed to delete',
    },
    Glyph: IconTrash,
  }
}

export { useMarkAsRemoved, removeFromTreeKey, removeFromTreeMutation }
