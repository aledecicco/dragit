import { IconDownload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useSelectedUpstream } from '@/state/upstream'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface FastForwardBranchArgs {
  branch: BranchName
  remote: RemoteName
  remoteBranch: BranchName
}

const fastForwardBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'fast_forward_branch',
  }) as const

const fastForwardBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [fastForwardBranchKey(repoPath)],
    mutationFn: (args: FastForwardBranchArgs) => {
      return invoke('fast_forward_branch', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useFastForwardBranch = (branch: BranchInfo): Action => {
  const fastForwardBranch = useRepositoryMutation(fastForwardBranchMutation)
  const upstream = useSelectedUpstream(branch)

  return {
    id: {
      key: 'branch_operation',
      operation: 'fast_forward',
      branch: branch.name,
    },
    blockedBy: [{ key: 'branch_operation', branch: branch.name }],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      if (!upstream) {
        throw new Error('No upstream set for branch')
      }

      await fastForwardBranch.mutateAsync({
        branch: branch.name,
        remote: upstream.remote,
        remoteBranch: upstream.remoteBranch,
      })
    },
    label: {
      idle: 'Fast-forward',
      running: 'Fast-forwarding',
      success: 'Fast-forwarded',
      error: 'Failed to fast-forward',
    },
    Glyph: IconDownload,
  }
}

export {
  useFastForwardBranch,
  fastForwardBranchKey,
  fastForwardBranchMutation,
  type FastForwardBranchArgs,
}
