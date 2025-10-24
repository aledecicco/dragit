import { IconWorldUpload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchName, RemoteRef } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface SetUpstreamArgs {
  branch: BranchName
  remoteRef: RemoteRef
}

const setUpstreamKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'set_upstream',
  }) as const

const setUpstreamMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [setUpstreamKey(repoPath)],
    mutationFn: (args: SetUpstreamArgs) => {
      return invoke('set_upstream', { repoPath, ...args })
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

export {
  useSetUpstream,
  setUpstreamKey,
  setUpstreamMutation,
  type SetUpstreamArgs,
}
