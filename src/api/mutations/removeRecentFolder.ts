import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { mutationOptions } from '../utils'

const removeRecentFolderKey = ['remove_recent_folder'] as const

const removeRecentFolderMutation = mutationOptions({
  mutationKey: removeRecentFolderKey,
  mutationFn: (args: { recentPath: string }) => {
    return invoke('remove_recent', args)
  },
  networkMode: 'always',
})

const useRemoveRecentFolder = () => useMutation(removeRecentFolderMutation)

export { useRemoveRecentFolder, removeRecentFolderKey }
