import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'

const removeRemoteKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'remove_remote',
  }) as const

const removeRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [removeRemoteKey(path)],
    mutationFn: (args: { name: RemoteName }) => {
      return invoke('remove_remote', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useRemoveRemote = () => useRepositoryMutation(removeRemoteMutation)

export { useRemoveRemote, removeRemoteKey }
