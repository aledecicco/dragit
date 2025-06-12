import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const addToIndexKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'add_to_index',
  }) as const

const addToIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [addToIndexKey(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('add_to_index', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useAddToIndex = () => useRepositoryMutation(addToIndexMutation)

export { useAddToIndex, addToIndexKey }
