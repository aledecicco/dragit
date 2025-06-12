import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const discardStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'discard_stash',
  }) as const

const discardStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [discardStashKey(path)],
    mutationFn: (args: { index: number }) => {
      return invoke('discard_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useDiscardStash = () => useRepositoryMutation(discardStashMutation)

export { useDiscardStash, discardStashKey }
