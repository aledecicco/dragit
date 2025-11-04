import { IconDownload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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

const usePullBranch = (branch: BranchInfo | undefined): Action => {
  const pullBranch = useRepositoryMutation(pullBranchMutation)

  return {
    id: `pull_branch:${branch?.name}`,
    run: async () => {
      if (!branch) {
        throw new Error('No branch specified')
      }

      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      // TODO: check if this should use the global remote set.
      await pullBranch.mutateAsync({
        branch: branch.name,
        remote: branch.upstream?.remote ?? 'origin',
        remoteBranch: branch.upstream?.remoteBranch ?? branch.name,
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
