import { IconGitBranch, IconSwitchHorizontal } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useChangeSelectedBase, useSelectedBase } from '@/state/branches'
import { useHeadReference } from '@/utils/repository'

import type { BranchName, CommitId, RefName, TagName } from '../models'
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
    mutationFn: async (args: CheckoutArgs) => {
      return invoke('checkout', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useDummyCheckout = (): Action => {
  return {
    id: {
      key: 'branch_operation',
      operation: 'checkout',
    },
    run: async () => {},
    Glyph: IconGitBranch,
    label: {
      idle: 'Checkout',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  }
}

const useCheckoutNew = (): Action<RefName> => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      refType: 'new',
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async (refName) => {
      await checkout.mutateAsync({ reference: refName, isNew: true })
    },
    Glyph: IconGitBranch,
    label: {
      idle: 'Create and check out',
      running: 'Checking out',
      success: 'Checked out',
      error: 'Checkout failed',
    },
  }
}

const useMakeCheckoutCommit = (): ((commit: CommitId) => Action) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (commit: CommitId): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      reference: commit,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      await checkout.mutateAsync({ reference: commit, isNew: false })
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

const useMakeCheckoutBranch = (): ((branch: BranchName) => Action) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (branch: BranchName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      reference: branch,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      await checkout.mutateAsync({ reference: branch, isNew: false })
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

const useMakeCheckoutTag = (): ((tag: TagName) => Action) => {
  const checkout = useRepositoryMutation(checkoutMutation)

  return (tag: TagName): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'checkout',
      reference: tag,
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      await checkout.mutateAsync({ reference: tag, isNew: false })
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

const useSwitchBranches = (): Action => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)
  const changeSelectedBase = useChangeSelectedBase()
  const checkout = useRepositoryMutation(checkoutMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'switch',
    },
    blockedBy: [{ key: 'branch_operation' }],
    run: async () => {
      if (!currentReference) {
        throw new Error('No branch selected')
      }

      if (!baseReference) {
        throw new Error('No base branch selected')
      }

      changeSelectedBase(baseReference, currentReference)
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
  useDummyCheckout,
  useCheckoutNew,
  useMakeCheckoutCommit,
  useMakeCheckoutBranch,
  useSwitchBranches,
  useMakeCheckoutTag,
  checkoutKey,
  checkoutMutation,
  type CheckoutArgs,
}
