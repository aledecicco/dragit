import { IconDeviceFloppy } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { RemoteFormValues } from '@/common/RemotesDialog/Form'
import type { FormAction } from '@/ui/Form'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

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

const useAddRemote = (): FormAction<RemoteFormValues> => {
  const addRemote = useRepositoryMutation(addRemoteMutation)

  return {
    id: 'add_remote',
    Glyph: IconDeviceFloppy,
    label: {
      idle: 'Save',
      running: 'Saving',
      success: 'Saved',
      error: 'Failed',
    },
    run: async ([formState]) => {
      if (formState.values.name && formState.values.url) {
        await addRemote.mutateAsync({
          name: formState.values.name,
          url: formState.values.url,
        })
      }
    },
  }
}

export { useAddRemote, addRemoteKey, type AddRemoteArgs }
