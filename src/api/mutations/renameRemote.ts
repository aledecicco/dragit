import { IconPencil } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { RemoteName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface RenameRemoteArgs {
  name: RemoteName
  newName: RemoteName
}

const renameRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'rename_remote',
  }) as const

const renameRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [renameRemoteKey(repoPath)],
    mutationFn: (args: RenameRemoteArgs) => {
      return invoke('rename_remote', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRenameRemote = (name: RemoteName): Action<RemoteName> => {
  const renameRemote = useRepositoryMutation(renameRemoteMutation)

  return {
    id: {
      key: 'remote_operation',
      operation: 'rename',
      remote: name,
    },
    blockedBy: [{ key: 'remote_operation' }],
    run: async (newName) => {
      await renameRemote.mutateAsync({ name, newName })
    },
    Glyph: IconPencil,
    label: {
      idle: 'Rename remote',
      running: 'Renaming remote',
      success: 'Remote renamed',
      error: 'Failed to rename',
    },
  }
}

export {
  useRenameRemote,
  renameRemoteKey,
  renameRemoteMutation,
  type RenameRemoteArgs,
}
