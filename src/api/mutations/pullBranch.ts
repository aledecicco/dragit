import { IconDownload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { getSelectedUpstream } from '@/state/upstream'
import { useBranchResolver } from '@/utils/repository'

import type { BranchName, RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface PullBranchArgs {
  remote: RemoteName
  remoteBranch: BranchName
  isRebase: boolean
}

const pullBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'pull_branch',
  }) as const

const pullBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [pullBranchKey(repoPath)],
    mutationFn: (args: PullBranchArgs) => {
      return invoke('pull_branch', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useMakePullBranch = (): ((branch: BranchName) => Action) => {
  const pullBranch = useRepositoryMutation(pullBranchMutation)
  const resolveBranch = useBranchResolver()

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'pull',
      type: 'current',
      branch,
    },
    blockedBy: [
      { key: 'branch_operation', branch },
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      if (resolveBranch(branch)?.type !== 'local') {
        throw new Error('Branch is not local')
      }

      const upstream = getSelectedUpstream(branch)
      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pullBranch.mutateAsync({
        remote: upstream.remote,
        remoteBranch: upstream.remoteBranch,
        isRebase: false,
      })
    },
    label: {
      idle: 'Pull',
      running: 'Pulling',
      success: 'Pulled',
      error: 'Failed to pull',
    },
    Glyph: IconDownload,
  })
}

const useMakeRebaseBranch = (): ((branch: BranchName) => Action) => {
  const pullBranch = useRepositoryMutation(pullBranchMutation)
  const resolveBranch = useBranchResolver()

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'rebase',
      type: 'current',
      branch,
    },
    blockedBy: [
      { key: 'branch_operation', branch },
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      if (resolveBranch(branch)?.type !== 'local') {
        throw new Error('Branch is not local')
      }

      const upstream = getSelectedUpstream(branch)
      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pullBranch.mutateAsync({
        remote: upstream.remote,
        remoteBranch: upstream.remoteBranch,
        isRebase: true,
      })
    },
    label: {
      idle: 'Rebase',
      running: 'Rebasing',
      success: 'Rebased',
      error: 'Failed to rebase',
    },
    Glyph: IconDownload,
  })
}

export {
  useMakePullBranch,
  useMakeRebaseBranch,
  pullBranchKey,
  pullBranchMutation,
  type PullBranchArgs,
}
