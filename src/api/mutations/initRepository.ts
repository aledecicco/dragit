import { invoke } from '@tauri-apps/api/core'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

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

// TODO: action?
const useInitRepository = () => useRepositoryMutation(initRepositoryMutation)

export { useInitRepository, initRepositoryKey }
