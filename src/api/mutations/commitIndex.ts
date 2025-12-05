import { IconMessageCheck } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

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

const useCommitIndex = (): Action<CommitIndexArgs> => {
  const commitIndex = useRepositoryMutation(commitIndexMutation)

  return {
    id: {
      key: 'modify_branch',
      operation: 'commit',
      type: 'current',
    },
    blockedBy: [{ key: 'modify_branch', type: 'current' }],
    run: async (args) => {
      await commitIndex.mutateAsync(args)
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

export {
  useCommitIndex,
  commitIndexKey,
  commitIndexMutation,
  type CommitIndexArgs,
}
