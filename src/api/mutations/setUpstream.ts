import {
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteRef } from '../models'
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

const useSetUpstream = (branch: BranchInfo | undefined): Action<RemoteRef> => {
  const setUpstream = useRepositoryMutation(setUpstreamMutation)

  return {
    id: `set_upstream:${branch}`,
    run: async (remoteRef: RemoteRef) => {
      if (!branch) {
        throw new Error('No branch specified')
      }

      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      await setUpstream.mutateAsync({ branch: branch.name, remoteRef })
    },
    label: {
      idle: 'Set upstream',
      running: 'Setting upstream',
      success: 'Upstream set',
      error: 'Failed to set upstream',
    },
    Glyph:
      branch?.type === 'local'
        ? branch.remote === undefined
          ? IconWorldQuestion
          : IconWorld
        : IconWorldCancel,
  }
}

export {
  useSetUpstream,
  setUpstreamKey,
  setUpstreamMutation,
  type SetUpstreamArgs,
}
