import { IconRefresh } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface FetchRemoteArgs {
  remote: RemoteName
}

const fetchRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'fetch_remote',
  }) as const

const fetchRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [fetchRemoteKey(repoPath)],
    mutationFn: (args: FetchRemoteArgs) => {
      return invoke('fetch_remote', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useMakeFetchRemote = (): ((name: RemoteName) => Action) => {
  const fetchRemote = useRepositoryMutation(fetchRemoteMutation)

  return (name: RemoteName): Action => ({
    id: {
      key: 'remote_operation',
      operation: 'fetch',
      remote: name,
    },
    blockedBy: [{ key: 'remote_operation', remote: name }],
    run: async () => {
      await fetchRemote.mutateAsync({
        remote: name,
      })
    },
    label: {
      idle: 'Fetch remote',
      running: 'Fetching remote',
      success: 'Remote fetched',
      error: 'Failed',
    },
    Glyph: IconRefresh,
  })
}

export {
  useMakeFetchRemote,
  fetchRemoteKey,
  fetchRemoteMutation,
  type FetchRemoteArgs,
}
