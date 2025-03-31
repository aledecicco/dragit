import { IconSwitchHorizontal } from '@tabler/icons-react'

import { useCheckoutLocal } from '@api/mutations'
import { useQueryBranches, useQueryHeadInfo } from '@api/queries'
import { BranchSelector } from '@common/BranchSelector'
import { changeBaseBranch, useSelectedBranches } from '@context/branches'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'

const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const { branch, baseBranch } = useSelectedBranches()
  const checkout = useCheckoutLocal()

  return (
    <>
      <BranchSelector
        className={cn('w-65 col-start-1 row-start-1')}
        branch={branch}
        branches={branchesQuery.data}
        allowEmpty={false}
        onBranchChange={(newOption) => {
          checkout.mutate({ branch: newOption.data.name })
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
            checkout.mutate({ branch: baseBranch.name })
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
          changeBaseBranch(newOption.data)
        }}
        placeholder="Choose a base branch..."
        disabled={headInfoQuery.isLoading || branchesQuery.isLoading}
      />
    </>
  )
}

export { BranchSelectors }
