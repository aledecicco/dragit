import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'

const fetchRemoteKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'fetch_remote',
  }) as const

const fetchRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [fetchRemoteKey(path)],
    mutationFn: (args: { remote: RemoteName }) => {
      return invoke('fetch_remote', { path: path, ...args })
    },
    networkMode: 'online',
  })

const useFetchRemote = () => useRepositoryMutation(fetchRemoteMutation)

export { useFetchRemote, fetchRemoteKey }
