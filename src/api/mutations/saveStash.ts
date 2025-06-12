import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const saveStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'stash',
  }) as const

const saveStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [saveStashKey(path)],
    mutationFn: (args: { message: string; includeUntracked: boolean }) => {
      return invoke('stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useSaveStash = () => useRepositoryMutation(saveStashMutation)

export { useSaveStash, saveStashKey }
