import { IconEraser } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { CommitInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface RevertCommitArgs {
  reference: string
  isMerge: boolean
}

const revertCommitKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'revert_commit',
  }) as const

const revertCommitMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [revertCommitKey(repoPath)],
    mutationFn: (args: RevertCommitArgs) => {
      return invoke('revert_commit', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRevertCommit = (commit: CommitInfo): Action => {
  const revertCommit = useRepositoryMutation(revertCommitMutation)
  const isMerge = commit.parents.length > 1

  return {
    id: {
      key: 'branch_operation',
      operation: 'revert_commit',
      type: 'current',
      reference: commit.id,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await revertCommit.mutateAsync({
        reference: commit.id,
        isMerge,
      })
    },
    label: {
      idle: isMerge ? 'Revert this merge' : 'Revert this commit',
      running: isMerge ? 'Reverting merge' : 'Reverting commit',
      success: isMerge ? 'Merge reverted' : 'Commit reverted',
      error: isMerge ? 'Failed to revert merge' : 'Failed to revert commit',
    },
    Glyph: IconEraser,
  }
}

export {
  useRevertCommit,
  revertCommitKey,
  revertCommitMutation,
  type RevertCommitArgs,
}
