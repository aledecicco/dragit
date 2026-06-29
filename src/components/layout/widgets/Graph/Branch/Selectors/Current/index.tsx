import { match } from 'ts-pattern'

import { RefSelector } from '@/common/RefSelector'
import { useBranchOffSomeBranchInteraction } from '@/interactions/branch'
import {
  useCheckoutPresenter,
  useCheckoutSomeBranchInteraction,
  useCheckoutSomeCommitInteraction,
  useCheckoutSomeTagInteraction,
  useCreateAndCheckoutBranchInteraction,
} from '@/interactions/checkout'
import {
  useTagSomeBranchInteraction,
  useTagSomeCommitInteraction,
} from '@/interactions/tag'
import { triggerInteraction } from '@/state/actions'
import type { ComboboxProps } from '@/ui/Combobox'
import { ComboboxItem } from '@/ui/Combobox/Item'
import { useBranch, useHeadReference } from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'

interface CurrentBranchSelectorProps extends Partial<ComboboxProps> {}

/**
 * The combobox used to checkout references.
 */
const CurrentBranchSelector = (props: CurrentBranchSelectorProps) => {
  const { ...comboboxProps } = props

  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)

  const checkoutTracker = useCheckoutPresenter()
  const branchOff = useBranchOffSomeBranchInteraction()
  const checkoutBranch = useCheckoutSomeBranchInteraction()
  const checkoutTag = useCheckoutSomeTagInteraction()
  const checkoutCommit = useCheckoutSomeCommitInteraction()

  return (
    <RefSelector
      placeholder="Checkout a branch..."
      iconProps={propsWithCn(
        comboboxProps.iconProps,
        match(checkoutTracker.actionStatus)
          .with('success', () => 'text-success-300')
          .with('error', () => 'text-danger-600')
          .with('running', () => 'animate-spin')
          .otherwise(() => undefined),
      )}
      {...propsWithCn(comboboxProps, 'w-full border border-dark-50')}
      disabled={
        checkoutTracker.actionStatus === 'running' ||
        checkoutTracker.actionStatus === 'disabled' ||
        !currentReference ||
        props.disabled
      }
      reference={currentReference}
      pinnedBranches={currentBranch ? [currentBranch.name] : undefined}
      onSelectBranch={(_, branch) => {
        if (branch?.type === 'remote') {
          triggerInteraction(branchOff(branch))
        } else if (branch?.type === 'local') {
          triggerInteraction(checkoutBranch(branch))
        }
      }}
      onSelectTag={(_, tag) => {
        if (tag) {
          triggerInteraction(checkoutTag(tag))
        }
      }}
      onSelectCommit={(_, commit) => {
        if (commit) {
          triggerInteraction(checkoutCommit(commit))
        }
      }}
      noBranchMatches={(search) => <NoBranchMatches search={search} />}
      noTagMatches={(search) => <NoTagMatches search={search} />}
    />
  )
}

const NoBranchMatches = (props: { search: string }) => {
  const { search } = props
  const createAndCheckoutBranch = useCreateAndCheckoutBranchInteraction()

  return (
    <ComboboxItem
      className={cn('text-light-500 italic')}
      value={search}
      onClick={() => {
        triggerInteraction(createAndCheckoutBranch(search))
      }}
    >
      Create branch <b className={cn('text-light-50')}>{search}</b> from current
      commit
    </ComboboxItem>
  )
}

const NoTagMatches = (props: { search: string }) => {
  const { search } = props
  const currentReference = useHeadReference()
  const tagBranch = useTagSomeBranchInteraction()
  const tagCommit = useTagSomeCommitInteraction()

  return (
    <ComboboxItem
      className={cn('text-light-500 italic')}
      value={search}
      onClick={() => {
        if (!currentReference) return

        match(currentReference)
          .with({ type: 'commit' }, ({ refName: commitId }) => {
            triggerInteraction(tagCommit(commitId, search))
          })
          .with({ type: 'branch' }, ({ refName: branchName }) => {
            triggerInteraction(tagBranch(branchName, search))
          })
          .exhaustive()
      }}
    >
      Create tag <b className={cn('text-light-50')}>{search}</b> from current
      commit
    </ComboboxItem>
  )
}

export { CurrentBranchSelector, type CurrentBranchSelectorProps }
