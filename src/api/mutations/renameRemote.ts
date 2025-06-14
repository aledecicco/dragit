import { invoke } from '@tauri-apps/api/core'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const renameRemoteKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'rename_remote',
  }) as const

const renameRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [renameRemoteKey(path)],
    mutationFn: (args: { name: RemoteName; newName: RemoteName }) => {
      return invoke('rename_remote', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useRenameRemote = () => useRepositoryMutation(renameRemoteMutation)

export { useRenameRemote, renameRemoteKey }
