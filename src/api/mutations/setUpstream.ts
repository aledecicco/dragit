import { invoke } from '@tauri-apps/api/core'

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

const useSetUpstream = () => useRepositoryMutation(setUpstreamMutation)

export { useSetUpstream, setUpstreamKey }
