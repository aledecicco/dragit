import { IconUpload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'
import { useSelectedBranches } from '@/context/branches'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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
  const pushBranch = useRepositoryMutation(pushBranchMutation)
  const { currentBranch } = useSelectedBranches()

  return {
    id: {
      key: 'modify_branch',
      operation: 'push',
      branch: branch.name,
    },
    blockedBy: [
      { key: 'modify_branch', branch: branch.name },
      ...(currentBranch?.name === branch.name
        ? [{ key: 'modify_branch', type: 'current' }, { key: 'file_operation' }]
        : []),
    ],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
        remote: branch.upstream?.remote ?? 'origin',
        remoteBranch: branch.upstream?.remoteBranch ?? branch.name,
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
  const pushBranch = useRepositoryMutation(pushBranchMutation)

  return {
    id: {
      key: 'modify_branch',
      operation: 'force_push',
      branch: branch.name,
    },
    blockedBy: [{ key: 'modify_branch', branch: branch.name }],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
        remote: branch.upstream?.remote ?? 'origin',
        remoteBranch: branch.upstream?.remoteBranch ?? branch.name,
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
