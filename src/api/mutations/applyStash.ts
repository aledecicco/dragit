import { invoke } from '@tauri-apps/api/core'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const applyStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'apply_stash',
  }) as const

const applyStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [applyStashKey(path)],
    mutationFn: (args: { stashId: string }) => {
      return invoke('apply_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useApplyStash = () => useRepositoryMutation(applyStashMutation)

export { useApplyStash, applyStashKey }
