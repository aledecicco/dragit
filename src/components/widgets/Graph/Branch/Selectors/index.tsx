import { IconGitBranch } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useCheckout, useSwitchBranches } from '@/api/mutations/checkout'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { runAction, useActionPresenters } from '@/context/actions'
import { changeSelectedBase, useSelectedReferences } from '@/context/branches'
import { getUpstreamReference, useSelectedUpstream } from '@/context/upstream'
import { ActionButton } from '@/lib/ActionButton'
import { Combobox } from '@/ui/Combobox'
import { useBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'

import { getBaseBranchOptions, getCurrentBranchOptions } from '../../utils'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const { currentReference, baseReference } = useSelectedReferences()
  const currentBranch = useBranch(currentReference)
  const currentUpstream = useSelectedUpstream(currentBranch)

  const checkout = useCheckout()
  const checkoutTracker = useActionPresenters(checkout)
  const switchBranches = useSwitchBranches()

  const checkoutOptions = getCurrentBranchOptions(branchesQuery.data ?? [])

  const baseOptions = getBaseBranchOptions(
    branchesQuery.data ?? [],
    currentBranch?.name,
    currentBranch && currentUpstream
      ? getUpstreamReference(currentUpstream)
      : undefined,
  )

  return (
    <>
      <Combobox
        className={cn('w-65 col-start-1 row-start-1')}
        option={currentBranch}
        options={checkoutOptions}
        getValue={(branch) => branch.name}
        setOption={(newBranch) => {
          runAction(checkout, { reference: newBranch.name, isNew: false })
        }}
        placeholder={
          currentReference?.type === 'commit'
            ? `Detached at #${currentReference.refName}`
            : 'Checkout a branch...'
        }
        disabled={
          checkoutTracker.actionStatus === 'running' ||
          checkoutTracker.actionStatus === 'disabled' ||
          !headInfoQuery.data ||
          !branchesQuery.data
        }
        Glyph={checkoutTracker.Glyph}
        iconProps={{
          className: cn(
            match(checkoutTracker.actionStatus)
              .with('success', () => 'text-success-300')
              .with('error', () => 'text-danger-600')
              .with('running', () => 'animate-spin')
              .otherwise(() => undefined),
          ),
        }}
      />

      <ActionButton
        action={switchBranches}
        className={cn('mx-1 col-start-2 row-start-1')}
        variant="filled"
        status="neutral"
        disabled={!currentReference || !baseReference}
        size="md"
        round
        compact
      />

      <Combobox
        className={cn('w-65 col-start-3 row-start-1')}
        option={baseReference}
        options={baseOptions}
        getValue={(ref) => ref.refName}
        setOption={(newRef) => {
          if (currentReference) {
            changeSelectedBase(currentReference, newRef ?? null)
          }
        }}
        emptyOption="No base branch"
        placeholder={
          baseReference?.type === 'commit'
            ? `#${baseReference.refName}`
            : 'Choose a base branch...'
        }
        disabled={!headInfoQuery.data || !branchesQuery.data}
        Glyph={IconGitBranch}
      />
    </>
  )
}

export { BranchSelectors }
