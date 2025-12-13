import { IconGitMerge } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, CommitId, RefName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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
      key: 'modify_branch',
      operation: 'merge',
      type: 'current',
    },
    blockedBy: [
      { key: 'modify_branch', type: 'current' },
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

const useMergeBranch = (branch: BranchInfo): Action => {
  const merge = useRepositoryMutation(mergeMutation)

  return {
    id: {
      key: 'modify_branch',
      operation: 'merge',
      type: 'current',
    },
    blockedBy: [
      { key: 'modify_branch', type: 'current' },
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
  }
}

const useMergeCommit = (commit: CommitId): Action => {
  const merge = useRepositoryMutation(mergeMutation)

  return {
    id: {
      key: 'modify_branch',
      operation: 'merge',
      type: 'current',
    },
    blockedBy: [{ key: 'modify_branch', type: 'current' }],
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
  }
}

export {
  useMerge,
  useMergeBranch,
  useMergeCommit,
  mergeKey,
  mergeMutation,
  type MergeArgs,
}
