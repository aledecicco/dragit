import { invoke } from '@tauri-apps/api/core'

import type { BranchName, RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const pullBranchKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'pull_branch',
  }) as const

const pullBranchMutation = (path: string) =>
  mutationOptions({
    mutationKey: [pullBranchKey(path)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
      isRebase: boolean
    }) => {
      return invoke('pull_branch', { path: path, ...args })
    },
    networkMode: 'online',
  })

const usePullBranch = () => useRepositoryMutation(pullBranchMutation)

export { usePullBranch, pullBranchKey }
