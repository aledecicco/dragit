import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import type { BranchName, RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'

const pushBranchKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'push_branch',
  }) as const

const pushBranchMutation = (path: string) =>
  mutationOptions({
    mutationKey: [pushBranchKey(path)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
      isForce: boolean
      setUpstream: boolean
    }) => {
      return invoke('push_branch', { path: path, ...args })
    },
    networkMode: 'online',
  })

const usePushBranch = () => useRepositoryMutation(pushBranchMutation)

export { usePushBranch, pushBranchKey }
