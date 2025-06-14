import { IconSwitchHorizontal } from '@tabler/icons-react'

import { useCheckoutLocal } from '@/api/mutations'
import { useQueryBranches, useQueryHeadInfo } from '@/api/queries'
import { BranchSelector } from '@/common/BranchSelector'
import { changeBaseRef, useSelectedRefs } from '@/context/branches'
import { ActionButton } from '@/lib/ActionButton'
import { useBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const { reference, baseReference } = useSelectedRefs()
  const branch = useBranch(reference)
  const baseBranch = useBranch(baseReference)

  const checkout = useCheckoutLocal()

  const switchAction = {
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
  }

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
        placeholder={
          reference?.type === 'commit'
            ? `Detached at #${reference.refName}`
            : 'Checkout a branch...'
        }
        disabled={
          checkout.isPending || !headInfoQuery.data || !branchesQuery.data
        }
      />

      <ActionButton
        mainAction={switchAction}
        className={cn('mx-1 col-start-2 row-start-1')}
        variant="filled"
        status="neutral"
        disabled={!reference || !baseReference}
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
        placeholder={
          baseReference?.type === 'commit'
            ? `#${baseReference.refName}`
            : 'Choose a base branch...'
        }
        disabled={!headInfoQuery.data || !branchesQuery.data}
      />
    </>
  )
}

export { BranchSelectors }
