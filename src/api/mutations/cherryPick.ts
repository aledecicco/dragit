import { IconCherry } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { CommitInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CherryPickArgs {
  references: string[]
  isMerge: boolean
}

const cherryPickKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'cherry_pick',
  }) as const

const cherryPickMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [cherryPickKey(repoPath)],
    mutationFn: (args: CherryPickArgs) => {
      return invoke('cherry_pick', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useCherryPickCommit = (commit: CommitInfo): Action => {
  const cherryPick = useRepositoryMutation(cherryPickMutation)
  const isMerge = commit.parents.length > 1

  return {
    id: {
      key: 'branch_operation',
      operation: 'cherry_pick_commit',
      type: 'current',
      reference: commit.shortHash,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await cherryPick.mutateAsync({
        references: [commit.shortHash],
        isMerge,
      })
    },
    label: {
      idle: isMerge ? 'Cherry-pick this merge' : 'Cherry-pick this commit',
      running: isMerge ? 'Cherry-picking merge' : 'Cherry-picking commit',
      success: isMerge ? 'Merge cherry-picked' : 'Commit cherry-picked',
      error: isMerge
        ? 'Failed to cherry-pick merge'
        : 'Failed to cherry-pick commit',
    },
    Glyph: IconCherry,
  }
}

export {
  useCherryPickCommit,
  cherryPickKey,
  cherryPickMutation,
  type CherryPickArgs,
}
