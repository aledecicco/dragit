import { IconDownload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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

  return {
    id: {
      key: 'modify_branch',
      operation: 'fast_forward',
      branch: branch.name,
    },
    blockedBy: [{ key: 'modify_branch', branch: branch.name }],
    run: async () => {
      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      // TODO: check if this should use the global remote set.
      await fastForwardBranch.mutateAsync({
        branch: branch.name,
        remote: branch.upstream?.remote ?? 'origin',
        remoteBranch: branch.upstream?.remoteBranch ?? branch.name,
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
