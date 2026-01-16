import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useCheckout, useSwitchBranches } from '@/api/mutations/checkout'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { useQueryTags } from '@/api/queries/tags'
import { ActionButton } from '@/lib/ActionButton'
import { runAction, useActionPresenters } from '@/state/actions'
import { changeSelectedBase, useSelectedReferences } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import { Combobox } from '@/ui/Combobox'
import { ComboboxItem } from '@/ui/Combobox/Item'
import { ComboboxSection } from '@/ui/Combobox/Section'
import { ensurePresent } from '@/utils/array'
import { useBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()

  const { currentReference, baseReference } = useSelectedReferences()
  const currentBranch = useBranch(currentReference)
  const currentUpstream = useSelectedUpstream(currentBranch)

  const checkout = useCheckout()
  const checkoutTracker = useActionPresenters(checkout)
  const switchBranches = useSwitchBranches()

  const branchOptions = branchesQuery.data?.map((branch) => branch.name) ?? []
  const tagOptions = tagsQuery.data?.map((tag) => tag.name) ?? []

  return (
    <>
      <Combobox
        className={cn('w-65 col-start-1 row-start-1')}
        value={currentReference?.refName}
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
      >
        <ComboboxSection
          name="branches"
          onSelect={(value) => {
            runAction(checkout, {
              reference: value,
              isNew: false,
            })
          }}
          options={branchOptions}
          noMatches={(search) => (
            <ComboboxItem
              value={search}
              onClick={() => {
                runAction(checkout, { reference: search, isNew: true })
              }}
            >
              Create branch <b>{search}</b> from current commit
            </ComboboxItem>
          )}
        />

        <ComboboxSection
          name="tags"
          onSelect={(value) => {
            runAction(checkout, {
              reference: value,
              isNew: false,
            })
          }}
          options={tagOptions}
        />
      </Combobox>

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
        value={baseReference?.refName}
        placeholder={
          baseReference?.type === 'commit'
            ? `#${baseReference.refName}`
            : 'Choose a base branch...'
        }
        disabled={!headInfoQuery.data || !branchesQuery.data}
        Glyph={match(baseReference?.type)
          .with('commit', () => IconGitCommit)
          .with('tag', () => IconTag)
          .otherwise(() => IconGitBranch)}
      >
        <ComboboxSection
          name="branches"
          onSelect={(value) => {
            if (currentReference) {
              changeSelectedBase(currentReference, {
                type: 'branch',
                refName: value,
              })
            }
          }}
          options={
            currentUpstream
              ? ensurePresent(
                  branchOptions,
                  `${currentUpstream.remote}/${currentUpstream.remoteBranch}`,
                )
              : branchOptions
          }
        />

        <ComboboxSection
          name="tags"
          onSelect={(value) => {
            if (currentReference) {
              changeSelectedBase(currentReference, {
                type: 'tag',
                refName: value,
              })
            }
          }}
          options={tagOptions}
        />
      </Combobox>
    </>
  )
}

export { BranchSelectors }
