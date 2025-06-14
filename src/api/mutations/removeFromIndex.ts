import { invoke } from '@tauri-apps/api/core'

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

const useRemoveFromIndex = () => useRepositoryMutation(removeFromIndexMutation)

export { useRemoveFromIndex, removeFromIndexKey }
