import { IconPlayerTrackPrevFilled } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { CommitId } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface ResetHeadArgs {
  reference: string
}

const resetHeadKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'reset_head',
  }) as const

const resetHeadMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [resetHeadKey(repoPath)],
    mutationFn: (args: ResetHeadArgs) => {
      return invoke('reset_head', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useRewindCommit = (commit: CommitId): Action => {
  const resetHead = useRepositoryMutation(resetHeadMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'reset_head',
      type: 'current',
      reference: commit,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async () => {
      await resetHead.mutateAsync({
        reference: commit,
      })
    },
    label: {
      idle: 'Rewind to before this commit',
      running: 'Rewinding',
      success: 'Rewinded',
      error: 'Failed to rewind',
    },
    Glyph: IconPlayerTrackPrevFilled,
  }
}

export { useRewindCommit, resetHeadKey, resetHeadMutation, type ResetHeadArgs }
