import { IconGitBranch, IconPlus, IconRouteAltLeft } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { CreateBranchFormValues } from '@/common/CreateBranchDialog'
import type { Action } from '@/context/actions'
import type { FormAction } from '@/ui/Form'

import type { BranchName, RefName } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'
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
    id: 'create_branch',
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

const useCreateBranchAt = (
  reference: RefName,
): FormAction<CreateBranchFormValues> => {
  const createBranch = useCreateBranch()

  return {
    id: `create_branch:${reference}`,
    label: {
      idle: 'Create branch here',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconPlus,
    run: ([formState]) =>
      createBranch.run({
        branchName: formState.values.name,
        fromReference: reference,
      }),
  }
}

const useBranchOff = (
  reference: RefName,
): FormAction<CreateBranchFormValues> => {
  const checkout = useCheckout()

  return {
    id: 'checkout',
    label: {
      idle: 'Branch off from here',
      running: 'Creating branch',
      success: 'Branch created',
      error: 'Failed to create branch',
    },
    Glyph: IconRouteAltLeft,
    run: ([formState]) =>
      checkout.run({
        reference: formState.values.name,
        isNew: true,
        fromReference: reference,
      }),
  }
}

export {
  useCreateBranch,
  useCreateBranchAt,
  useBranchOff,
  createBranchKey,
  createBranchMutation,
  type CreateBranchArgs,
}
