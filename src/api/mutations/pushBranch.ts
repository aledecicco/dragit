import { IconUpload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useSelectedUpstream } from '@/state/upstream'
import { useCurrentBranch } from '@/utils/repository'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface PushBranchArgs {
  branch: BranchName
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

const usePushBranch = (branch: BranchInfo): Action => {
  const upstream = useSelectedUpstream(branch)
  const pushBranch = useRepositoryMutation(pushBranchMutation)

  const currentBranch = useCurrentBranch()

  return {
    id: {
      key: 'branch_operation',
      operation: 'push',
      branch: branch.name,
    },
    blockedBy: [
      { key: 'branch_operation', branch: branch.name },
      ...(currentBranch?.name === branch.name
        ? [
            { key: 'branch_operation', type: 'current' },
            { key: 'file_operation' },
          ]
        : []),
    ],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
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
  }
}

const useForcePushBranch = (branch: BranchInfo): Action => {
  const upstream = useSelectedUpstream(branch)
  const pushBranch = useRepositoryMutation(pushBranchMutation)

  const currentBranch = useCurrentBranch()

  return {
    id: {
      key: 'branch_operation',
      operation: 'force_push',
      branch: branch.name,
    },
    blockedBy: [
      { key: 'branch_operation', branch: branch.name },
      ...(currentBranch?.name === branch.name
        ? [
            { key: 'branch_operation', type: 'current' },
            { key: 'file_operation' },
          ]
        : []),
    ],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
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
  }
}

export {
  usePushBranch,
  useForcePushBranch,
  pushBranchKey,
  pushBranchMutation,
  type PushBranchArgs,
}
