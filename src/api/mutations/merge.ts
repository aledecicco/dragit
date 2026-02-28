import { IconGitMerge } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchInfo, CommitId, RefName } from '../models'
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

const useMerge = (): Action<MergeArgs> => {
  const merge = useRepositoryMutation(mergeMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'merge',
      type: 'current',
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async (args) => {
      await merge.mutateAsync(args)
    },
    Glyph: IconGitMerge,
    label: {
      idle: 'Merge',
      running: 'Merging',
      success: 'Merged',
      error: 'Merge failed',
    },
  }
}

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

const useMergeBranch = (branch: BranchInfo): Action => {
  return useMakeMergeBranch()(branch)
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

const useMergeCommit = (commit: CommitId): Action => {
  return useMakeMergeCommit()(commit)
}

export {
  useMerge,
  useMakeMergeBranch,
  useMergeBranch,
  useMakeMergeCommit,
  useMergeCommit,
  mergeKey,
  mergeMutation,
  type MergeArgs,
}
