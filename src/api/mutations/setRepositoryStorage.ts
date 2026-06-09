import { IconDeviceFloppy } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type {
  BranchName,
  Reference,
  RefName,
  RepositoryStorage,
  Upstream,
} from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

type SetRepositoryStorageArgs = Partial<RepositoryStorage>

interface SetRepositoryStorageRequest {
  storage: Partial<{
    branchBases: [BranchName, Reference | null][]
    branchUpstreams?: [BranchName, Upstream][]
    defaultBase?: RefName
  }>
}

const setRepositoryStorageKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'set_repository_storage',
  }) as const

const setRepositoryStorageMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [setRepositoryStorageKey(repoPath)],
    mutationFn: (args: SetRepositoryStorageArgs) => {
      const requestArgs: SetRepositoryStorageRequest = {
        storage: {},
      }

      if (args.branchBases) {
        requestArgs.storage.branchBases = [...args.branchBases.entries()]
      }

      if (args.branchUpstreams) {
        requestArgs.storage.branchUpstreams = [
          ...args.branchUpstreams.entries(),
        ]
      }

      if (args.defaultBase !== undefined) {
        requestArgs.storage.defaultBase = args.defaultBase
          ? args.defaultBase
          : ''
      }

      return invoke('set_repository_storage', { repoPath, ...requestArgs })
    },
    networkMode: 'always',
  })

const useSetRepositoryStorage = (): Action<Partial<RepositoryStorage>> => {
  const setRepositoryStorage = useRepositoryMutation(
    setRepositoryStorageMutation,
  )

  return {
    id: { key: 'set_repository_storage' },
    run: async (args) => {
      await setRepositoryStorage.mutateAsync(args)
    },
    label: {
      idle: 'Save settings for this repository',
      running: 'Saving settings',
      success: 'Settings saved',
      error: 'Failed to save settings',
    },
    Glyph: IconDeviceFloppy,
  }
}

export {
  useSetRepositoryStorage,
  setRepositoryStorageKey,
  setRepositoryStorageMutation,
  type SetRepositoryStorageArgs,
}
