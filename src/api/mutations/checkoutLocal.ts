import { IconGitBranch, IconSwitchHorizontal } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'
import { useSelectedBranches } from '@/utils/repository'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const checkoutLocalKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'checkout_local',
  }) as const

const checkoutLocalMutation = (path: string) =>
  mutationOptions({
    mutationKey: [checkoutLocalKey(path)],
    mutationFn: (args: { reference: string }) => {
      return invoke('checkout', { path: path, ...args })
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

export { useCheckoutLocal, useSwitchBranches, checkoutLocalKey }
