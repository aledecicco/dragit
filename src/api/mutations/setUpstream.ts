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

const useSetUpstream = (branch: BranchInfo): Action<RemoteRef> => {
  const setUpstream = useRepositoryMutation(setUpstreamMutation)

  return {
    id: {
      key: 'modify_branch',
      operation: 'set_upstream',
      branch: branch.name,
    },
    blockedBy: [{ key: 'modify_branch', branch: branch.name }],
    run: async (remoteRef: RemoteRef) => {
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
        ? branch.upstream === undefined
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
