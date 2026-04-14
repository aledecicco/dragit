import { IconClock, IconFolderOpen } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import { LogoGlyph } from '@/common/Logo'
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

  return {
    id: { key: 'open_folder' },
    run: async (newPath) => {
      await openFolder.mutateAsync({ newPath })
    },
    label: {
      idle: 'Choose a folder',
      running: 'Opening folder',
      success: 'New folder opened',
      error: 'Failed to open folder',
    },
    Glyph: IconFolderOpen,
  }
}

const useChangeCurrentFolder = (): Action<string> => {
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
        (currentDirQuery.isFetching ? 'Loading folder...' : 'Choose a folder'),
      running: 'Opening folder',
      success: 'New folder opened',
      error: 'Failed to open folder',
    },
    Glyph: LogoGlyph,
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
  useChangeCurrentFolder,
  useMakeOpenRecentFolder,
  useOpenRecentFolder,
  openFolderKey,
  openFolderMutation,
  type OpenFolderArgs,
}
