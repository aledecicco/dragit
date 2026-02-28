import { IconTrash } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

interface RemoveRecentFolderArgs {
  recentPath: string
}

const removeRecentFolderKey = ['remove_recent_folder'] as const

const removeRecentFolderMutation = mutationOptions({
  mutationKey: removeRecentFolderKey,
  mutationFn: (args: RemoveRecentFolderArgs) => {
    return invoke('remove_recent', { ...args })
  },
  networkMode: 'always',
})

const useMakeRemoveRecentFolder = (): ((recentPath: string) => Action) => {
  const remove = useMutation(removeRecentFolderMutation)

  return (recentPath: string): Action => ({
    id: { key: 'remove_recent_folder', path: recentPath },
    run: async () => {
      await remove.mutateAsync({ recentPath })
    },
    label: {
      idle: 'Remove',
      running: 'Removing',
      success: 'Removed',
      error: 'Failed to remove',
    },
    Glyph: IconTrash,
  })
}

const useRemoveRecentFolder = (recentPath: string): Action => {
  return useMakeRemoveRecentFolder()(recentPath)
}

export {
  useMakeRemoveRecentFolder,
  useRemoveRecentFolder,
  removeRecentFolderKey,
  removeRecentFolderMutation,
  type RemoveRecentFolderArgs,
}
