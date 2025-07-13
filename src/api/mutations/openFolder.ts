import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { mutationOptions } from '../utils'

const openFolderKey = ['open_folder'] as const

const openFolderMutation = mutationOptions({
  mutationKey: openFolderKey,
  mutationFn: (args: { newPath: string }) => {
    return invoke('open_folder', args)
  },
  networkMode: 'always',
})

// TODO: action?
const useOpenFolder = () => useMutation(openFolderMutation)

export { useOpenFolder, openFolderKey }
