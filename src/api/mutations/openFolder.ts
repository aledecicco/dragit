import { IconFolderOpen } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { useQueryCurrentDir } from '../queries/currentDir'

interface OpenFolderArgs {
  newPath: string
}

const openFolderKey = ['open_folder'] as const

const openFolderMutation = mutationOptions({
  mutationKey: openFolderKey,
  mutationFn: (args: OpenFolderArgs) => {
    return invoke('open_folder', { ...args })
  },
  networkMode: 'always',
})

const useOpenFolder = (): Action<string> => {
  const openFolder = useMutation(openFolderMutation)
  const currentDirQuery = useQueryCurrentDir()

  return {
    id: { key: 'open_folder' },
    run: async (newPath) => {
      await openFolder.mutateAsync({ newPath })
    },
    label: {
      idle:
        currentDirQuery.data?.path ??
        (currentDirQuery.isFetching
          ? 'Loading directory...'
          : 'Choose a directory'),
      running: 'Opening folder',
      success: 'New folder opened',
      error: 'Failed to open folder',
    },
    Glyph: IconFolderOpen,
  }
}

export { useOpenFolder, openFolderKey, openFolderMutation, type OpenFolderArgs }
