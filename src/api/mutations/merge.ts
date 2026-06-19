import { IconGitMerge } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchInfo, CommitId, RefName, TagInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface MergeArgs {
  reference: RefName
}

const mergeKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'merge',
  }) as const

const mergeMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [mergeKey(repoPath)],
    mutationFn: (args: MergeArgs) => {
      return invoke('merge', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeMergeBranch = (): ((branch: BranchInfo) => Action) => {
  const merge = useRepositoryMutation(mergeMutation)

  return (branch: BranchInfo): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'merge',
      type: 'current',
      branch: branch.name,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await merge.mutateAsync({ reference: branch.name })
    },
    Glyph: IconGitMerge,
    label: {
      idle: 'Merge this branch',
      running: 'Merging',
      success: 'Merged',
      error: 'Merge failed',
    },
  })
}

const useMakeMergeTag = (): ((tag: TagInfo) => Action) => {
  const merge = useRepositoryMutation(mergeMutation)

  return (tag: TagInfo): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'merge',
      type: 'current',
      tag: tag.name,
    },
    blockedBy: [{ key: 'branch_operation', type: 'current' }],
    run: async () => {
      await merge.mutateAsync({ reference: tag.name })
    },
    Glyph: IconGitMerge,
    label: {
      idle: 'Merge this tag',
      running: 'Merging',
      success: 'Merged',
      error: 'Merge failed',
    },
  })
}

const useMakeMergeCommit = (): ((commit: CommitId) => Action) => {
  const merge = useRepositoryMutation(mergeMutation)

  return (commit: CommitId): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'merge',
      type: 'current',
      commit,
    },
    blockedBy: [{ key: 'branch_operation', type: 'current' }],
    run: async () => {
      await merge.mutateAsync({ reference: commit })
    },
    Glyph: IconGitMerge,
    label: {
      idle: 'Merge this commit',
      running: 'Merging',
      success: 'Merged',
      error: 'Merge failed',
    },
  })
}

export {
  useMakeMergeBranch,
  useMakeMergeTag,
  useMakeMergeCommit,
  mergeKey,
  mergeMutation,
  type MergeArgs,
}
