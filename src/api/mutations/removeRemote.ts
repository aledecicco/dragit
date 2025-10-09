import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const removeRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'remove_remote',
  }) as const

const removeRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [removeRemoteKey(repoPath)],
    mutationFn: (args: { name: RemoteName }) => {
      return invoke('remove_remote', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRemoveRemote = (name: RemoteName): Action => {
  const removeRemote = useRepositoryMutation(removeRemoteMutation)

  return {
    id: `remove_remote:${name}`,
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

export { useRemoveRemote, removeRemoteKey }
