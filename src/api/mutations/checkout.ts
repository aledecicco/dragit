import { IconGitBranch, IconSwitchHorizontal } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useSelectedReferences } from '@/state/branches'

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
      { key: 'modify_branch', type: 'current' },
    ],
    run: async (args) => {
      await checkout.mutateAsync(args)
    },
    Glyph: IconGitBranch,
    label: {
      idle: 'Checkout',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  }
}

const useCheckoutBranch = (branch: BranchInfo): Action => {
  const checkout = useCheckout()

  return {
    ...checkout,
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      branch: branch.name,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: () => checkout.run({ reference: branch.name, isNew: false }),
  }
}

const useCheckoutTag = (tag: TagInfo): Action => {
  const checkout = useCheckout()

  return {
    ...checkout,
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      tag: tag.name,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: () => checkout.run({ reference: tag.name, isNew: false }),
  }
}

const useSwitchBranches = (): Action => {
  const { baseReference } = useSelectedReferences()
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
  useCheckoutBranch,
  useSwitchBranches,
  useCheckoutTag,
  checkoutKey,
  checkoutMutation,
  type CheckoutArgs,
}
