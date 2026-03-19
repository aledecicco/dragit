import { IconGitBranch, IconSwitchHorizontal } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useSelectedBase } from '@/state/branches'
import { useHeadReference } from '@/utils/repository'

import type { BranchInfo, RefName, TagInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CheckoutArgs {
  reference: RefName
  isNew: boolean
  fromReference?: RefName
}

const checkoutKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'checkout',
  }) as const

const checkoutMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [checkoutKey(repoPath)],
    mutationFn: (args: CheckoutArgs) => {
      return invoke('checkout', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useCheckout = (): Action<CheckoutArgs> => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'checkout',
    },
    blockedBy: [
      { key: 'branch_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (args) => {
      await checkout.mutateAsync(args)
    },
    derivedIds: (args) => [
      {
        key: 'branch_operation',
        operation: 'checkout',
        reference: args.reference,
      },
    ],
    Glyph: IconGitBranch,
    label: {
      idle: 'Checkout',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  }
}

const useMakeCheckoutBranch = (): ((branch: BranchInfo) => Action) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (branch: BranchInfo): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      reference: branch.name,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      await checkout.mutateAsync({ reference: branch.name, isNew: false })
    },
    Glyph: IconGitBranch,
    label: {
      idle: 'Checkout',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  })
}

const useCheckoutBranch = (branch: BranchInfo): Action => {
  return useMakeCheckoutBranch()(branch)
}

const useMakeCheckoutTag = (): ((tag: TagInfo) => Action) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (tag: TagInfo): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      reference: tag.name,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      await checkout.mutateAsync({ reference: tag.name, isNew: false })
    },
    Glyph: IconGitBranch,
    label: {
      idle: 'Checkout',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  })
}

const useCheckoutTag = (tag: TagInfo): Action => {
  return useMakeCheckoutTag()(tag)
}

const useSwitchBranches = (): Action => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)
  const checkout = useRepositoryMutation(checkoutMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'switch',
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      if (!baseReference) {
        throw new Error('No base branch selected')
      }

      await checkout.mutateAsync({
        reference: baseReference.refName,
        isNew: false,
      })
    },
    derivedIds: baseReference
      ? () => [
          {
            key: 'branch_operation',
            operation: 'checkout',
            reference: baseReference?.refName,
          },
        ]
      : undefined,
    Glyph: IconSwitchHorizontal,
    label: {
      idle: 'Switch branch and base branch',
      running: 'Switching branches',
      success: 'Branches switched',
      error: 'Failed to switch',
    },
  }
}

export {
  useCheckout,
  useMakeCheckoutBranch,
  useCheckoutBranch,
  useSwitchBranches,
  useMakeCheckoutTag,
  useCheckoutTag,
  checkoutKey,
  checkoutMutation,
  type CheckoutArgs,
}
