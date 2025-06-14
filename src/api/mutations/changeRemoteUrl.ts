import { invoke } from '@tauri-apps/api/core'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const changeRemoteUrlKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'change_remote_url',
  }) as const

const changeRemoteUrlMutation = (path: string) =>
  mutationOptions({
    mutationKey: [changeRemoteUrlKey(path)],
    mutationFn: (args: { name: RemoteName; url: string }) => {
      return invoke('change_remote_url', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useChangeRemoteUrl = () => useRepositoryMutation(changeRemoteUrlMutation)

export { useChangeRemoteUrl, changeRemoteUrlKey }
