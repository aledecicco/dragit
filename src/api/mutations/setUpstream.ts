import {
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchInfo, BranchName, RemoteRef } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

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

const useMakeSetUpstream = (): ((branch: BranchInfo) => Action<RemoteRef>) => {
  const setUpstream = useRepositoryMutation(setUpstreamMutation)

  return (branch: BranchInfo): Action<RemoteRef> => ({
    id: {
      key: 'branch_operation',
      operation: 'set_upstream',
      branch: branch.name,
    },
    blockedBy: [{ key: 'branch_operation', branch: branch.name }],
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
  })
}

const useSetUpstream = (branch: BranchInfo): Action<RemoteRef> => {
  return useMakeSetUpstream()(branch)
}

export {
  useMakeSetUpstream,
  useSetUpstream,
  setUpstreamKey,
  setUpstreamMutation,
  type SetUpstreamArgs,
}
