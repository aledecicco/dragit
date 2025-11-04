import { IconGitBranch } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo, BranchName } from '@/api/models'
import {
  useCheckoutLocal,
  useSwitchBranches,
} from '@/api/mutations/checkoutLocal'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { runAction, useActionPresenters } from '@/context/actions'
import { changeSelectedBase, useSelectedReferences } from '@/context/branches'
import { ActionButton } from '@/lib/ActionButton'
import { Combobox, type ComboboxOption } from '@/ui/Combobox'
import { useBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const { currentReference, baseReference } = useSelectedReferences()
  const currentBranch = useBranch(currentReference)
  const baseBranch = useBranch(baseReference)

  const checkout = useCheckoutLocal()
  const checkoutTracker = useActionPresenters(checkout)
  const switchBranches = useSwitchBranches()

  const checkoutOptions: ComboboxOption<BranchInfo>[] = getBranchOptions(
    branchesQuery.data,
  )
  const baseOptions: ComboboxOption<BranchInfo | null>[] = [
    { value: '', data: null },
    ...getBranchOptions(branchesQuery.data, currentBranch?.name),
  ]

  return (
    <>
      <Combobox
        className={cn('w-65 col-start-1 row-start-1')}
        option={
          currentBranch
            ? {
                value: currentBranch.name,
                data: currentBranch,
              }
            : undefined
        }
        options={checkoutOptions}
        setOption={(newOption) => {
          runAction(checkout, newOption.data.name)
        }}
        renderOption={(option) => option.data.name}
        placeholder={
          currentReference?.type === 'commit'
            ? `Detached at #${currentReference.refName}`
            : 'Checkout a branch...'
        }
        disabled={
          checkoutTracker.actionStatus === 'running' ||
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
        mainAction={switchBranches}
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
        option={
          baseBranch
            ? {
                value: baseBranch.name,
                data: baseBranch,
              }
            : undefined
        }
        options={baseOptions}
        setOption={(newOption) => {
          if (currentReference) {
            changeSelectedBase(
              currentReference,
              mapFn(newOption.data, (newOption) => ({
                type: 'branch',
                refName: newOption.name,
              })),
            )
          }
        }}
        renderOption={(option) => option.data?.name ?? 'No base branch'}
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

/**
 * Generates the appropriate options for a branch selector based on the provided config.
 *
 * @param branches The list of all available branches.
 * @param allowEmpty Whether to allow selecting an empty option.
 * @param exclude An optional branch name to exclude from the options.
 *
 * @returns An array of combobox options.
 */
const getBranchOptions = (
  branches: BranchInfo[] | undefined,
  exclude?: BranchName,
) => {
  let options =
    branches?.map((branch) => {
      const option = {
        value: branch.name,
        data: branch,
      }
      return option
    }) ?? []

  if (exclude) {
    options = options.filter((option) => option.value !== exclude)
  }

  return options
}

export { BranchSelectors }
