import { IconEraser } from '@tabler/icons-react'
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

const useResetHead = (commit: CommitId): Action => {
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
      idle: 'Uncommit',
      running: 'Undoing commit',
      success: 'Commit undone',
      error: 'Failed to undo commit',
    },
    Glyph: IconEraser,
  }
}

export { useResetHead, resetHeadKey, resetHeadMutation, type ResetHeadArgs }
