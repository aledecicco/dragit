import { IconTrash } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { mutationOptions } from '../utils'

const removeRecentFolderKey = ['remove_recent_folder'] as const

const removeRecentFolderMutation = mutationOptions({
  mutationKey: removeRecentFolderKey,
  mutationFn: (args: { recentPath: string }) => {
    return invoke('remove_recent', args)
  },
  networkMode: 'always',
})

const useRemoveRecentFolder = (recentPath: string): Action => {
  const remove = useMutation(removeRecentFolderMutation)

  return {
    id: `remove_recent:${recentPath}`,
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
  }
}

export { useRemoveRecentFolder, removeRecentFolderKey }
