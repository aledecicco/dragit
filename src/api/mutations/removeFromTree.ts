import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { FileInfo } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const removeFromTreeKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'remove_from_tree',
  }) as const

const removeFromTreeMutation = (path: string) =>
  mutationOptions({
    mutationKey: [removeFromTreeKey(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_tree', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useMarkAsRemoved = (file: FileInfo): Action => {
  const remove = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: `remove_from_tree:${file.path}`,
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

export { useMarkAsRemoved, removeFromTreeKey }
