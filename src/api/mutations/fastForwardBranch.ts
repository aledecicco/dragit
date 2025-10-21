import { IconDownload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const fastForwardBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'fast_forward_branch',
  }) as const

const fastForwardBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [fastForwardBranchKey(repoPath)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
    }) => {
      return invoke('fast_forward_branch', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useFastForwardBranch = (branch: BranchInfo | undefined): Action => {
  const fastForwardBranch = useRepositoryMutation(fastForwardBranchMutation)

  return {
    id: `fast_forward_branch:${branch?.name}`,
    run: async () => {
      if (!branch) {
        throw new Error('No branch specified')
      }

      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      // TODO: check if this should use the global remote set.
      await fastForwardBranch.mutateAsync({
        branch: branch.name,
        remote: branch.remote?.remoteName ?? 'origin',
        remoteBranch: branch.remote?.branchName ?? branch.name,
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

export { useFastForwardBranch, fastForwardBranchKey }
