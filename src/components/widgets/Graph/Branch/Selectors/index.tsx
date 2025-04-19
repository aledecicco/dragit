import { IconSwitchHorizontal } from '@tabler/icons-react'

import { useCheckout } from '@api/mutations'
import { useQueryBranches, useQueryHeadInfo } from '@api/queries'
import { BranchSelector } from '@common/BranchSelector'
import { changeBaseRef } from '@context/branches'
import { IconButton } from '@ui/IconButton'
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

      <IconButton
        Glyph={IconSwitchHorizontal}
        label="Switch branch and base branch"
        className={cn('mx-1 col-start-2 row-start-1')}
        variant="neutral"
        disabled={!branch || !baseBranch}
        size="md"
        onClick={() => {
          if (baseBranch) {
            checkout.mutateAsync({ reference: baseBranch.name })
          }
        }}
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
