import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface RemoveBranchArgs {
  branchName: BranchName
}

const removeBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'remove_branch',
  }) as const

const removeBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [removeBranchKey(repoPath)],
    mutationFn: (args: RemoveBranchArgs) => {
      return invoke('remove_branch', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRemoveBranch = (branch: BranchInfo): Action => {
  const removeBranch = useRepositoryMutation(removeBranchMutation)

  return {
    id: `remove_branch:${branch.name}`,
    run: async () => {
      await removeBranch.mutateAsync({ branchName: branch.name })
    },
    Glyph: IconTrash,
    label: {
      idle: 'Delete branch',
      running: 'Creating branch',
      success: 'Branch deleted',
      error: 'Failed to delete branch',
    },
  }
}

export {
  useRemoveBranch,
  removeBranchKey,
  removeBranchMutation,
  type RemoveBranchArgs,
}
