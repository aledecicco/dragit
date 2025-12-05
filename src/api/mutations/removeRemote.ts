import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { RemoteName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface RemoveRemoteArgs {
  name: RemoteName
}

const removeRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'remove_remote',
  }) as const

const removeRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [removeRemoteKey(repoPath)],
    mutationFn: (args: RemoveRemoteArgs) => {
      return invoke('remove_remote', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRemoveRemote = (name: RemoteName): Action => {
  const removeRemote = useRepositoryMutation(removeRemoteMutation)

  return {
    id: {
      key: 'remote_operation',
      operation: 'remove',
      remote: name,
    },
    blockedBy: [{ key: 'remote_operation' }],
    run: async () => {
      await removeRemote.mutateAsync({ name })
    },
    Glyph: IconTrash,
    label: {
      idle: 'Remove remote',
      running: 'Removing remote',
      success: 'Remote removed',
      error: 'Failed to remove',
    },
  }
}

export {
  useRemoveRemote,
  removeRemoteKey,
  removeRemoteMutation,
  type RemoveRemoteArgs,
}
