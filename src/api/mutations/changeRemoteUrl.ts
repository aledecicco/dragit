import { IconPencil } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

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
    mutationFn: (args: { name: RemoteName; newUrl: string }) => {
      return invoke('change_remote_url', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useChangeRemoteUrl = (name: RemoteName): Action<string> => {
  const changeRemoteUrl = useRepositoryMutation(changeRemoteUrlMutation)

  return {
    id: 'change_remote_url',
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

export { useChangeRemoteUrl, changeRemoteUrlKey }
