import { invoke } from '@tauri-apps/api/core'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const addRemoteKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'add_remote',
  }) as const

const addRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [addRemoteKey(path)],
    mutationFn: (args: { name: RemoteName; url: string }) => {
      return invoke('add_remote', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useAddRemote = () => useRepositoryMutation(addRemoteMutation)

export { useAddRemote, addRemoteKey }
