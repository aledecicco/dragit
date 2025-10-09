import { IconPencil } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const renameRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'rename_remote',
  }) as const

const renameRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [renameRemoteKey(repoPath)],
    mutationFn: (args: { name: RemoteName; newName: RemoteName }) => {
      return invoke('rename_remote', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRenameRemote = (name: RemoteName): Action<string> => {
  const renameRemote = useRepositoryMutation(renameRemoteMutation)

  return {
    id: `rename_remote:${name}`,
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

export { useRenameRemote, renameRemoteKey }
