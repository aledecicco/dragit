import { IconGitBranch, IconSwitchHorizontal } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'
import { useSelectedBranches } from '@/utils/repository'

import type { BranchInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface CheckoutLocalArgs {
  reference: string
}

const checkoutLocalKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'checkout_local',
  }) as const

const checkoutLocalMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [checkoutLocalKey(repoPath)],
    mutationFn: (args: CheckoutLocalArgs) => {
      return invoke('checkout', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useCheckoutLocal = (): Action<string> => {
  const checkout = useRepositoryMutation(checkoutLocalMutation)

  return {
    id: 'checkout_local',
    run: async (reference) => {
      await checkout.mutateAsync({ reference })
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

const useCheckoutBranch = (branch: BranchInfo): Action<void> => {
  const checkoutLocal = useCheckoutLocal()

  return {
    ...checkoutLocal,
    run: async () => {
      await checkoutLocal.run(branch.name)
    },
  }
}

const useSwitchBranches = (): Action => {
  const { baseBranch } = useSelectedBranches()
  const checkoutLocal = useRepositoryMutation(checkoutLocalMutation)

  return {
    id: 'switch_branches',
    run: async () => {
      if (baseBranch) {
        await checkoutLocal.mutateAsync({ reference: baseBranch.name })
      } else {
        throw new Error('No base branch selected')
      }
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
  useCheckoutLocal,
  useCheckoutBranch,
  useSwitchBranches,
  checkoutLocalKey,
  checkoutLocalMutation,
  type CheckoutLocalArgs,
}
