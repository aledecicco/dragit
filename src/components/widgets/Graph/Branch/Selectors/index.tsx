import { IconGitBranch } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useCheckoutLocal, useSwitchBranches } from '@/api/mutations'
import { useQueryBranches, useQueryHeadInfo } from '@/api/queries'
import { BranchSelector } from '@/common/BranchSelector'
import { runAction, useActionPresenters } from '@/context/actions'
import { changeBaseRef, useSelectedRefs } from '@/context/branches'
import { ActionButton } from '@/lib/ActionButton'
import { Icon } from '@/ui/Icon'
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
  const checkoutTracker = useActionPresenters(checkout)
  const switchBranches = useSwitchBranches()

  return (
    <>
      <BranchSelector
        className={cn('w-65 col-start-1 row-start-1')}
        branch={branch}
        branches={branchesQuery.data}
        allowEmpty={false}
        onBranchChange={(newOption) => {
          runAction(checkout, newOption.data.name)
        }}
        placeholder={
          reference?.type === 'commit'
            ? `Detached at #${reference.refName}`
            : 'Checkout a branch...'
        }
        disabled={
          checkoutTracker.actionStatus === 'running' ||
          !headInfoQuery.data ||
          !branchesQuery.data
        }
        decorator={
          <Icon
            Glyph={checkoutTracker.Glyph}
            size="md"
            className={cn(
              match(checkoutTracker.actionStatus)
                .with('success', () => 'text-success-300')
                .with('error', () => 'text-danger-600')
                .with('running', () => 'animate-spin')
                .otherwise(() => undefined),
            )}
          />
        }
      />

      <ActionButton
        mainAction={switchBranches}
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
        decorator={<Icon Glyph={IconGitBranch} size="md" />}
      />
    </>
  )
}

export { BranchSelectors }
