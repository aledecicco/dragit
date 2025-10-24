import { IconMessageCheck } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { FormAction } from '@/ui/Form'

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

const useCommitIndex = (): FormAction<CommitIndexArgs> => {
  const commitIndex = useRepositoryMutation(commitIndexMutation)

  return {
    id: 'commit_index',
    run: async ([formState]) => {
      if (formState.values.message) {
        await commitIndex.mutateAsync({
          message: formState.values.message,
          isAmend: false,
        })
      }
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
