import { IconUpload } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, BranchName, RemoteName } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

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

const usePushBranch = (branch: BranchInfo | undefined): Action => {
  const pushBranch = useRepositoryMutation(pushBranchMutation)

  return {
    id: `push_branch:${branch?.name}`,
    run: async () => {
      if (!branch) {
        throw new Error('No branch specified')
      }

      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
        remote: branch.remote?.remoteName ?? 'origin',
        remoteBranch: branch.remote?.branchName ?? branch.name,
        isForce: false,
        setUpstream: true,
      })
    },
    label: {
      idle: 'Push',
      running: 'Pushing',
      success: 'Pushed',
      error: 'Failed to push',
    },
    Glyph: IconUpload,
  }
}

const useForcePushBranch = (branch: BranchInfo | undefined): Action => {
  const pushBranch = useRepositoryMutation(pushBranchMutation)

  return {
    id: `force_push_branch:${branch?.name}`,
    run: async () => {
      if (!branch) {
        throw new Error('No branch specified')
      }

      if (branch.type !== 'local') {
        throw new Error('Branch is not local')
      }

      await pushBranch.mutateAsync({
        branch: branch.name,
        remote: branch.remote?.remoteName ?? 'origin',
        remoteBranch: branch.remote?.branchName ?? branch.name,
        isForce: true,
        setUpstream: true,
      })
    },
    label: {
      idle: 'Force push',
      running: 'Force pushing',
      success: 'Force pushed',
      error: 'Failed to force push',
    },
    Glyph: IconUpload,
  }
}

export { usePushBranch, useForcePushBranch, pushBranchKey }
