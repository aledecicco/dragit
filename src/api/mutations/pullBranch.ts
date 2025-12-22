import { IconDownload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'
import { useSelectedUpstream } from '@/context/upstream'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface PullBranchArgs {
  branch: BranchName
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

const usePullBranch = (branch: BranchInfo): Action => {
  const pullBranch = useRepositoryMutation(pullBranchMutation)
  const upstream = useSelectedUpstream(branch)

  return {
    id: {
      key: 'modify_branch',
      operation: 'pull',
      type: 'current',
    },
    blockedBy: [
      { key: 'modify_branch', branch: branch.name },
      { key: 'modify_branch', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await pullBranch.mutateAsync({
        branch: branch.name,
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
  }
}

export { usePullBranch, pullBranchKey, pullBranchMutation, type PullBranchArgs }
