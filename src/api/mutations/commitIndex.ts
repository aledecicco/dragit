import { IconMessageCheck, IconMessageCog } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CommitIndexArgs {
  message: string
  isAmend: boolean
}

const commitIndexKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'commit_index',
  }) as const

const commitIndexMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [commitIndexKey(repoPath)],
    mutationFn: (args: CommitIndexArgs) => {
      return invoke('commit_index', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useCommitIndex = (): Action<Omit<CommitIndexArgs, 'isAmend'>> => {
  const commitIndex = useRepositoryMutation(commitIndexMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'commit',
      type: 'current',
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async (args) => {
      await commitIndex.mutateAsync({ ...args, isAmend: false })
    },
    label: {
      idle: 'Commit',
      running: 'Committing',
      success: 'Committed',
      error: 'Failed',
    },
    Glyph: IconMessageCheck,
  }
}

const useAmend = (): Action<Omit<CommitIndexArgs, 'isAmend'>> => {
  const commitIndex = useRepositoryMutation(commitIndexMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'amend',
      type: 'current',
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async (args) => {
      await commitIndex.mutateAsync({ ...args, isAmend: true })
    },
    label: {
      idle: 'Amend',
      running: 'Amending',
      success: 'Amended',
      error: 'Failed to amend',
    },
    Glyph: IconMessageCog,
  }
}

export {
  useCommitIndex,
  useAmend,
  commitIndexKey,
  commitIndexMutation,
  type CommitIndexArgs,
}
