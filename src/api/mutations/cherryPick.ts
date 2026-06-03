import { IconCherry } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { CommitId } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CherryPickArgs {
  references: string[]
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

const useCherryPickCommit = (commit: CommitId): Action => {
  const cherryPick = useRepositoryMutation(cherryPickMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'cherry_pick_commit',
      type: 'current',
      reference: commit,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await cherryPick.mutateAsync({
        references: [commit],
      })
    },
    label: {
      idle: 'Cherry-pick this commit',
      running: 'Cherry-picking commit',
      success: 'Commit cherry-picked',
      error: 'Failed to cherry-pick commit',
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
