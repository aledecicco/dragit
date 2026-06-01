import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useCheckout, useSwitchBranches } from '@/api/mutations/checkout'
import { useMakeBranchOff } from '@/api/mutations/createBranch'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { ActionButton } from '@/lib/ActionButton'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { triggerInteraction, useActionPresenters } from '@/state/actions'
import { changeSelectedBase, useSelectedBase } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import { Combobox } from '@/ui/Combobox'
import { ComboboxItem } from '@/ui/Combobox/Item'
import { ComboboxSection } from '@/ui/Combobox/Section'
import { ensurePresent } from '@/utils/array'
import {
  getUpstreamReference,
  useBranch,
  useHeadReference,
} from '@/utils/repository'
import { cn } from '@/utils/styles'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const remoteBranchesQuery = useQueryBranches('remote')
  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()

  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)
  const currentUpstream = useSelectedUpstream(currentBranch)
  const baseReference = useSelectedBase(currentReference)
  const baseBranch = useBranch(baseReference)

  const checkout = useCheckout()
  const checkoutTracker = useActionPresenters(checkout)
  const switchBranches = useSwitchBranches()
  const makeBranchOff = useMakeBranchOff()

  const branchOptions = branchesQuery.data?.map((branch) => branch.name) ?? []
  const baseBranchOptions = [
    '',
    ...(currentUpstream
      ? ensurePresent(
          branchOptions,
          getUpstreamReference(currentUpstream).refName,
          true,
        )
      : branchOptions
    ).filter((branch) => branch !== currentReference?.refName),
  ]
  const tagOptions = tagsQuery.data?.map((tag) => tag.name) ?? []

  const currentSelector = (
    <Combobox
      className={cn('w-full max-w-65 col-start-1 row-start-1')}
      value={
        currentReference?.type === 'commit'
          ? `#${currentReference.refName}`
          : (currentReference?.refName ?? '')
      }
      placeholder="Checkout a branch..."
      disabled={
        checkoutTracker.actionStatus === 'running' ||
        checkoutTracker.actionStatus === 'disabled' ||
        !currentReference
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

  const baseSelector = (
    <Combobox
      className={cn('w-full max-w-65 col-start-3 row-start-1')}
      value={
        baseReference?.type === 'commit'
          ? `#${baseReference.refName}`
          : (baseReference?.refName ?? '')
      }
      placeholder="Choose a base branch..."
      disabled={!currentReference}
      Glyph={match(baseReference?.type)
        .with('commit', () => IconGitCommit)
        .with('tag', () => IconTag)
        .otherwise(() => IconGitBranch)}
    >
      <ComboboxSection
        name="branches"
        onSelect={(value) => {
          if (currentReference) {
            changeSelectedBase(
              currentReference,
              value
                ? {
                    type: 'branch',
                    refName: value,
                  }
                : null,
            )
          }
        }}
        options={baseBranchOptions}
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
  )

  return (
    <>
      {currentBranch ? (
        <Draggable
          dragPayload={{
            type: 'branch',
            dragged: currentBranch,
            label: currentBranch.name,
            Glyph: IconGitBranch,
          }}
        >
          {currentSelector}
        </Draggable>
      ) : (
        currentSelector
      )}

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

      {baseBranch ? (
        <Draggable
          dragPayload={{
            type: 'branch',
            dragged: baseBranch,
            label: baseBranch.name,
            Glyph: IconGitBranch,
          }}
        >
          {baseSelector}
        </Draggable>
      ) : (
        baseSelector
      )}
    </>
  )
}

export { BranchSelectors }
