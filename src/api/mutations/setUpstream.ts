import { IconWorldUpload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchName, RemoteRef } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const setUpstreamKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'set_upstream',
  }) as const

const setUpstreamMutation = (path: string) =>
  mutationOptions({
    mutationKey: [setUpstreamKey(path)],
    mutationFn: (args: { branch: BranchName; remoteRef: RemoteRef }) => {
      return invoke('set_upstream', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useSetUpstream = (branch: BranchName): Action<RemoteRef> => {
  const setUpstream = useRepositoryMutation(setUpstreamMutation)

  return {
    id: `set_upstream:${branch}`,
    run: async (remoteRef: RemoteRef) => {
      await setUpstream.mutateAsync({ branch, remoteRef })
    },
    label: {
      idle: 'Set upstream',
      running: 'Setting upstream',
      success: 'Upstream set',
      error: 'Failed to set upstream',
    },
    Glyph: IconWorldUpload,
  }
}

export { useSetUpstream, setUpstreamKey }
