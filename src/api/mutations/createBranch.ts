import {
  IconCloudDown,
  IconGitBranch,
  IconPlus,
  IconRouteAltLeft,
} from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchInfo, BranchName, RefName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'
import { useCheckout } from './checkout'

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

const useCreateBranch = (): Action<CreateBranchArgs> => {
  const createBranch = useRepositoryMutation(createBranchMutation)

  return {
    id: {
      key: 'create_branch',
    },
    run: async (args) => {
      await createBranch.mutateAsync(args)
    },
    label: {
      idle: 'Create branch',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconGitBranch,
  }
}

const useCreateBranchAt = (reference: RefName): Action<BranchName> => {
  const createBranch = useCreateBranch()

  return {
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
    run: (name) =>
      createBranch.run({
        branchName: name,
        fromReference: reference,
      }),
  }
}

const useTrackBranch = (branch: BranchInfo): Action<BranchName> => {
  const createBranch = useCreateBranch()

  return {
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      at: branch.name,
    },
    blockedBy: [{ key: 'branch_operation' }],
    label: {
      idle: 'Track this branch',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconCloudDown,
    run: (name) =>
      createBranch.run({
        branchName: name,
        fromReference: branch.name,
      }),
  }
}

const useBranchOff = (reference: RefName): Action<BranchName> => {
  const checkout = useCheckout()

  return {
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
    run: (name) =>
      checkout.run({
        reference: name,
        isNew: true,
        fromReference: reference,
      }),
  }
}

export {
  useCreateBranch,
  useCreateBranchAt,
  useTrackBranch,
  useBranchOff,
  createBranchKey,
  createBranchMutation,
  type CreateBranchArgs,
}
