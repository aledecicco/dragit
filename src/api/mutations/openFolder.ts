import { IconClock, IconFolderOpen } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

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

const useMakeOpenRecentFolder = (): ((folder: string) => Action) => {
  const openFolder = useMutation(openFolderMutation)

  return (folder: string) => ({
    id: { key: 'open_folder', type: 'recent', folder },
    run: async () => {
      await openFolder.mutateAsync({ newPath: folder })
    },
    label: {
      idle: folder,
      running: 'Opening folder',
      success: 'New folder opened',
      error: 'Failed to open folder',
    },
    Glyph: IconClock,
  })
}

const useOpenRecentFolder = (folder: string): Action => {
  return useMakeOpenRecentFolder()(folder)
}

export {
  useOpenFolder,
  useMakeOpenRecentFolder,
  useOpenRecentFolder,
  openFolderKey,
  openFolderMutation,
  type OpenFolderArgs,
}
