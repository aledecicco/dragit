import { IconMinus } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { FileInfo } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const removeFromIndexKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'remove_from_index',
  }) as const

const removeFromIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [removeFromIndexKey(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_index', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useUnstageFile = (file: FileInfo): Action => {
  const unstage = useRepositoryMutation(removeFromIndexMutation)

  return {
    id: `unstage:${file.path}`,
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

export { useUnstageFile, removeFromIndexKey }
