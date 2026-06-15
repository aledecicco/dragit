import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useCheckout } from '@/api/mutations/checkout'
import { useMakeBranchOff } from '@/api/mutations/createBranch'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { triggerInteraction, useActionPresenters } from '@/state/actions'
import { Combobox, type ComboboxProps } from '@/ui/Combobox'
import { ComboboxItem } from '@/ui/Combobox/Item'
import { ComboboxSection } from '@/ui/Combobox/Section'
import { useHeadReference } from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'

interface CurrentBranchSelectorProps extends Partial<ComboboxProps> {}

/**
 * The combobox used to checkout references.
 */
const CurrentBranchSelector = (props: CurrentBranchSelectorProps) => {
  const { ...comboboxProps } = props

  const remoteBranchesQuery = useQueryBranches('remote')
  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()

  const currentReference = useHeadReference()

  const checkout = useCheckout()
  const checkoutTracker = useActionPresenters(checkout)
  const makeBranchOff = useMakeBranchOff()

  const branchOptions = branchesQuery.data?.map((branch) => branch.name) ?? []
  const tagOptions = tagsQuery.data?.map((tag) => tag.name) ?? []

  return (
    <Combobox
      placeholder="Checkout a branch..."
      Glyph={match(currentReference?.type)
        .with('commit', () => IconGitCommit)
        .with('tag', () => IconTag)
        .otherwise(() => IconGitBranch)}
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
        comboboxProps.disabled
      }
      value={
        currentReference?.type === 'commit'
          ? `#${currentReference.refName}`
          : (currentReference?.refName ?? '')
      }
    >
      <ComboboxSection
        name="branches"
        onSelect={async (value) => {
          const isRemoteBranch = remoteBranchesQuery.data?.some(
            (branch) => branch.name === value,
          )

          if (isRemoteBranch) {
            triggerInteraction({
              action: makeBranchOff(value),
              argsRequester: () =>
                requestBranchName(value, value.split('/').at(-1)),
            })
          } else {
            triggerInteraction({
              action: checkout,
              argsRequester: () => ({ reference: value, isNew: false }),
            })
          }
        }}
        options={branchOptions}
        noMatches={(search) => (
          <ComboboxItem
            className={cn('text-light-500 italic')}
            value={search}
            onClick={() => {
              triggerInteraction({
                action: checkout,
                argsRequester: () => ({ reference: search, isNew: true }),
              })
            }}
          >
            Create branch <b className={cn('text-light-50')}>{search}</b> from
            current commit
          </ComboboxItem>
        )}
      />

      <ComboboxSection
        name="tags"
        onSelect={(value) => {
          triggerInteraction({
            action: checkout,
            argsRequester: () => ({ reference: value, isNew: false }),
          })
        }}
        options={tagOptions}
      />
    </Combobox>
  )
}

export { CurrentBranchSelector }
