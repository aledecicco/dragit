import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const applyStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'apply_stash',
  }) as const

const applyStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [applyStashKey(path)],
    mutationFn: (args: { index: number; shouldDrop: boolean }) => {
      return invoke('apply_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useApplyStash = () => useRepositoryMutation(applyStashMutation)

export { useApplyStash, applyStashKey }
