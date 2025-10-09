import { IconRefresh } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const fetchRemoteKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'fetch_remote',
  }) as const

const fetchRemoteMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [fetchRemoteKey(repoPath)],
    mutationFn: (args: { remote: RemoteName }) => {
      return invoke('fetch_remote', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useFetchRemote = (remote: RemoteName | undefined): Action => {
  const fetchRemote = useRepositoryMutation(fetchRemoteMutation)

  return {
    id: `fetch_remote:${remote}`,
    run: async () => {
      if (!remote) {
        throw new Error('No remote specified')
      }

      await fetchRemote.mutateAsync({
        remote,
      })
    },
    label: {
      idle: 'Fetch remote',
      running: 'Fetching remote',
      success: 'Remote fetched',
      error: 'Failed',
    },
    Glyph: IconRefresh,
  }
}

export { useFetchRemote, fetchRemoteKey }
