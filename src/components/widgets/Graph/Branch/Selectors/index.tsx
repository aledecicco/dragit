import { IconSwitchHorizontal } from '@tabler/icons-react'

import { useCheckout } from '@api/mutations'
import { useQueryBranches, useQueryHeadInfo } from '@api/queries'
import { BranchSelector } from '@common/BranchSelector'
import { changeBaseRef } from '@context/branches'
import { ActionButton } from '@lib/ActionButton'
import { useSelectedBranches } from '@utils/repository'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'

const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const { branch, baseBranch } = useSelectedBranches()
  const checkout = useCheckout()

  return (
    <>
      <BranchSelector
        className={cn('w-65 col-start-1 row-start-1')}
        branch={branch}
        branches={branchesQuery.data}
        allowEmpty={false}
        onBranchChange={(newOption) => {
          checkout.mutateAsync({ reference: newOption.data.name })
        }}
        placeholder="Checkout a branch..."
        disabled={headInfoQuery.isLoading || branchesQuery.isLoading}
      />

      <ActionButton
        action={{
          run: async () => {
            if (baseBranch) {
              await checkout.mutateAsync({ reference: baseBranch.name })
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
        }}
        className={cn('mx-1 col-start-2 row-start-1')}
        variant="filled"
        status="neutral"
        disabled={!branch || !baseBranch}
        size="md"
        round
        compact
      />

      <BranchSelector
        className={cn('w-65 col-start-3 row-start-1')}
        branch={baseBranch}
        branches={branchesQuery.data}
        allowEmpty
        exclude={branch?.name}
        onBranchChange={(newOption) => {
          changeBaseRef(
            mapFn(newOption.data, (newOption) => ({
              type: 'branch',
              refName: newOption.name,
            })),
          )
        }}
        placeholder="Choose a base branch..."
        disabled={headInfoQuery.isLoading || branchesQuery.isLoading}
      />
    </>
  )
}

export { BranchSelectors }
