import { IconCloudDown, IconPlus, IconRouteAltLeft } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchName, RefName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'
import { checkoutMutation } from './checkout'

interface CreateBranchArgs {
  branchName: BranchName
  fromReference: RefName
}

const createBranchKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'create_branch',
  }) as const

const createBranchMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [createBranchKey(repoPath)],
    mutationFn: (args: CreateBranchArgs) => {
      return invoke('create_branch', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeCreateBranchAt = (): ((
  reference: RefName,
) => Action<BranchName>) => {
  const createBranch = useRepositoryMutation(createBranchMutation)

  return (reference: RefName): Action<BranchName> => ({
    id: {
      key: 'create_branch_at',
      at: reference,
    },
    label: {
      idle: 'Create branch here',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconPlus,
    run: async (name) => {
      await createBranch.mutateAsync({
        branchName: name,
        fromReference: reference,
      })
    },
  })
}

const useMakeTrackBranch = (): ((branch: BranchName) => Action<BranchName>) => {
  const createBranch = useRepositoryMutation(createBranchMutation)

  return (branch: BranchName): Action<BranchName> => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      at: branch,
    },
    blockedBy: [{ key: 'branch_operation' }],
    label: {
      idle: 'Track this branch',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconCloudDown,
    run: async (name) => {
      await createBranch.mutateAsync({
        branchName: name,
        fromReference: branch,
      })
    },
  })
}

const useMakeBranchOff = (): ((reference: RefName) => Action<BranchName>) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (reference: RefName): Action<BranchName> => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      at: reference,
    },
    blockedBy: [{ key: 'branch_operation' }],
    label: {
      idle: 'Branch off from here',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconRouteAltLeft,
    run: async (name) => {
      checkout.mutateAsync({
        reference: name,
        isNew: true,
        fromReference: reference,
      })
    },
  })
}

export {
  useMakeCreateBranchAt,
  useMakeTrackBranch,
  useMakeBranchOff,
  createBranchKey,
  createBranchMutation,
  type CreateBranchArgs,
}
