import { IconUpload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { getSelectedUpstream } from '@/state/upstream'
import { useBranchResolver, useCurrentBranch } from '@/utils/repository'

import type { BranchName, RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface PushBranchArgs {
  remote: RemoteName
  remoteBranch: BranchName
  isForce: boolean
  setUpstream: boolean
}

const pushBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'push_branch',
  }) as const

const pushBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [pushBranchKey(repoPath)],
    mutationFn: (args: PushBranchArgs) => {
      return invoke('push_branch', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useMakeForcePushBranch = (): ((branch: BranchName) => Action) => {
  const pushBranch = useRepositoryMutation(pushBranchMutation)
  const currentBranch = useCurrentBranch()
  const resolveBranch = useBranchResolver()

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'force_push',
      type: 'current',
      branch,
    },
    blockedBy: [
      { key: 'branch_operation', branch },
      ...(currentBranch?.name === branch
        ? [
            { key: 'branch_operation', type: 'current' },
            { key: 'file_operation' },
          ]
        : []),
    ],
    run: async () => {
      if (resolveBranch(branch)?.type !== 'local') {
        throw new Error('Branch is not local')
      }

      const upstream = getSelectedUpstream(branch)
      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pushBranch.mutateAsync({
        remote: upstream.remote,
        remoteBranch: upstream.remoteBranch,
        isForce: true,
        setUpstream: true,
      })
    },
    label: {
      idle: 'Force push',
      running: 'Force pushing',
      success: 'Force pushed',
      error: 'Failed to force push',
    },
    Glyph: IconUpload,
  })
}

const useMakePushBranch = (): ((branch: BranchName) => Action) => {
  const pushBranch = useRepositoryMutation(pushBranchMutation)
  const resolveBranch = useBranchResolver()

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'push',
      type: 'current',
      branch,
    },
    blockedBy: [{ key: 'branch_operation', branch }],
    run: async () => {
      if (resolveBranch(branch)?.type !== 'local') {
        throw new Error('Branch is not local')
      }

      const upstream = getSelectedUpstream(branch)
      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pushBranch.mutateAsync({
        remote: upstream.remote,
        remoteBranch: upstream.remoteBranch,
        isForce: false,
        setUpstream: true,
      })
    },
    label: {
      idle: 'Push',
      running: 'Pushing',
      success: 'Pushed',
      error: 'Failed to push',
    },
    Glyph: IconUpload,
  })
}

export {
  useMakePushBranch,
  useMakeForcePushBranch,
  pushBranchKey,
  pushBranchMutation,
  type PushBranchArgs,
}
