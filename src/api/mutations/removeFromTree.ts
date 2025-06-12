import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

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

const useRemoveFromTree = () => useRepositoryMutation(removeFromTreeMutation)

export { useRemoveFromTree, removeFromTreeKey }
