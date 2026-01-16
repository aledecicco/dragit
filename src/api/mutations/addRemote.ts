import { IconDeviceFloppy } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface AddRemoteArgs {
  name: RemoteName
  url: string
}

const addRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'add_remote',
  }) as const

const addRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [addRemoteKey(repoPath)],
    mutationFn: (args: AddRemoteArgs) => {
      return invoke('add_remote', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useAddRemote = (): Action<AddRemoteArgs> => {
  const addRemote = useRepositoryMutation(addRemoteMutation)

  return {
    id: { key: 'add_remote' },
    Glyph: IconDeviceFloppy,
    label: {
      idle: 'Save',
      running: 'Saving',
      success: 'Saved',
      error: 'Failed',
    },
    run: async (args) => {
      await addRemote.mutateAsync(args)
    },
  }
}

export { useAddRemote, addRemoteKey, addRemoteMutation, type AddRemoteArgs }
