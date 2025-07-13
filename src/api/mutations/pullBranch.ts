import { IconDownload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const pullBranchKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'pull_branch',
  }) as const

const pullBranchMutation = (path: string) =>
  mutationOptions({
    mutationKey: [pullBranchKey(path)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
      isRebase: boolean
    }) => {
      return invoke('pull_branch', { path: path, ...args })
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

      await pullBranch.mutateAsync({
        branch: branch.name,
        remote: branch.remote?.remoteName ?? 'origin',
        remoteBranch: branch.remote?.branchName ?? branch.name,
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

export { usePullBranch, pullBranchKey }
