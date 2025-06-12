import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const initRepositoryKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'init_repository',
  }) as const

const initRepositoryMutation = (path: string) =>
  mutationOptions({
    mutationKey: [initRepositoryKey(path)],
    mutationFn: () => {
      return invoke('init_repository', { path: path })
    },
    networkMode: 'always',
  })

const useInitRepository = () => useRepositoryMutation(initRepositoryMutation)

export { useInitRepository, initRepositoryKey }
