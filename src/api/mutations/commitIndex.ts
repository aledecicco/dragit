import { invoke } from '@tauri-apps/api/core'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const commitIndexKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'commit_index',
  }) as const

const commitIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [commitIndexKey(path)],
    mutationFn: (args: { message: string; isAmend: boolean }) => {
      return invoke('commit_index', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useCommitIndex = () => useRepositoryMutation(commitIndexMutation)

export { useCommitIndex, commitIndexKey }
