import { IconMessageCheck } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { FormAction } from '@/ui/Form'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

interface CommitIndexArgs {
  message: string
  isAmend: boolean
}

const commitIndexKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'commit_index',
  }) as const

const commitIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [commitIndexKey(path)],
    mutationFn: (args: CommitIndexArgs) => {
      return invoke('commit_index', { path, ...args })
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

export { useCommitIndex, commitIndexKey, type CommitIndexArgs }
