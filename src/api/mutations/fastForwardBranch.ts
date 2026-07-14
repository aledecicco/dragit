import { IconDownload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { getSelectedUpstream } from '@/state/upstream'
import { useBranchResolver } from '@/utils/repository'

import type { BranchName, RemoteName } from '../models'
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

const useMakeFastForwardBranch = (): ((branch: BranchName) => Action) => {
  const fastForwardBranch = useRepositoryMutation(fastForwardBranchMutation)
  const resolveBranch = useBranchResolver()

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'fast_forward',
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

      await fastForwardBranch.mutateAsync({
        branch,
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
  })
}

export {
  useMakeFastForwardBranch,
  fastForwardBranchKey,
  fastForwardBranchMutation,
  type FastForwardBranchArgs,
}
