import { IconPencil } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface ChangeRemoteUrlArgs {
  name: RemoteName
  newUrl: string
}

const changeRemoteUrlKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'change_remote_url',
  }) as const

const changeRemoteUrlMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [changeRemoteUrlKey(repoPath)],
    mutationFn: (args: ChangeRemoteUrlArgs) => {
      return invoke('change_remote_url', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useChangeRemoteUrl = (name: RemoteName): Action<string> => {
  const changeRemoteUrl = useRepositoryMutation(changeRemoteUrlMutation)

  return {
    id: {
      key: 'remote_operation',
      operation: 'change_url',
      remote: name,
    },
    blockedBy: [{ key: 'remote_operation' }],
    run: async (newUrl) => {
      await changeRemoteUrl.mutateAsync({ name, newUrl })
    },
    Glyph: IconPencil,
    label: {
      idle: 'Change URL',
      running: 'Changing URL',
      success: 'URL Changed',
      error: 'Failed to change URL',
    },
  }
}

export {
  useChangeRemoteUrl,
  changeRemoteUrlKey,
  changeRemoteUrlMutation,
  type ChangeRemoteUrlArgs,
}
