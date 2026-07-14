import { match } from 'ts-pattern'

import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import {
  useBranchOffSomeBranchInteraction,
  useMergeSomeBranchInteraction,
} from '@/interactions/branch'
import {
  useCheckoutSomeBranchInteraction,
  useCheckoutSomeCommitInteraction,
  useCheckoutSomeTagInteraction,
  useSwitchBranchesInteraction,
} from '@/interactions/checkout'
import { useMergeSomeCommitInteraction } from '@/interactions/commit'
import { useMergeSomeTagInteraction } from '@/interactions/tag'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { MatchingPayload } from '@/lib/DragAndDrop/utils'
import { triggerInteraction } from '@/state/actions'
import { useChangeSelectedBase, useSelectedBase } from '@/state/branches'
import { useBranchResolver, useHeadReference } from '@/utils/repository'
import { cn } from '@/utils/styles'

/**
 * Group of extra drop areas for the graph.
 */
const GraphDropAreas = () => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)
  const changeSelectedBase = useChangeSelectedBase()

  const switchBranches = useSwitchBranchesInteraction()
  const branchOff = useBranchOffSomeBranchInteraction()
  const checkoutBranch = useCheckoutSomeBranchInteraction()
  const resolveBranch = useBranchResolver()
  const checkoutTag = useCheckoutSomeTagInteraction()
  const checkoutCommit = useCheckoutSomeCommitInteraction()
  const mergeBranch = useMergeSomeBranchInteraction()
  const mergeTag = useMergeSomeTagInteraction()
  const mergeCommit = useMergeSomeCommitInteraction()

  const historyQuery = useQueryCommitHistory(currentReference?.refName)

  const validateReferenceDrop = (
    payload: MatchingPayload<'branch' | 'tag' | 'commit'>,
  ) => {
    return payload.dragged !== currentReference?.refName
  }

  const validateBaseReferenceDrop = (
    payload: MatchingPayload<'branch' | 'tag' | 'commit'>,
  ) => {
    return (
      payload.dragged !== baseReference?.refName &&
      payload.dragged !== currentReference?.refName
    )
  }

  return (
    <>
      <DropArea
        className={cn('absolute top-0 left-0 w-half h-18')}
        overlayProps={(payload) => ({
          className: cn(
            'rounded-sm flex-row',
            validateBaseReferenceDrop(payload) && 'rounded-r-none',
          ),
        })}
        acceptedTypes={['branch', 'tag', 'commit']}
        label={{
          branch: 'checkout this branch',
          tag: 'checkout this tag',
          commit: 'checkout this commit',
        }}
        extraValidation={validateReferenceDrop}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'branch' }, ({ dragged }) => {
              if (resolveBranch(dragged)?.type === 'remote') {
                triggerInteraction(branchOff(dragged))
              } else {
                triggerInteraction(checkoutBranch(dragged))
              }
            })
            .with({ type: 'tag' }, ({ dragged }) => {
              triggerInteraction(checkoutTag(dragged))
            })
            .with({ type: 'commit' }, ({ dragged }) => {
              triggerInteraction(checkoutCommit(dragged))
            })
            .exhaustive()
        }}
      />

      <DropArea
        className={cn('absolute top-0 right-0 w-half h-18')}
        overlayProps={(payload) => ({
          className: cn(
            'rounded-sm flex-row',
            validateReferenceDrop(payload) && 'rounded-l-none',
          ),
        })}
        acceptedTypes={['branch', 'tag', 'commit']}
        label={{
          branch: 'use this branch as base',
          tag: 'use this tag as base',
          commit: 'use this commit as base',
        }}
        extraValidation={validateBaseReferenceDrop}
        handleDrop={(payload) => {
          if (currentReference) {
            if (payload.dragged === currentReference.refName) {
              triggerInteraction(switchBranches)
            } else {
              changeSelectedBase(currentReference, {
                type: payload.type,
                refName: payload.dragged,
              })
            }
          }
        }}
      />

      <DropArea
        className={cn('absolute top-22 left-4 w-[calc(50%-2rem)] bottom-4')}
        acceptedTypes={['branch', 'tag', 'commit']}
        label={{
          branch: 'merge this branch',
          tag: 'merge this tag',
          commit: 'merge this commit',
        }}
        extraValidation={(payload) => {
          if (
            payload.type === 'commit' &&
            historyQuery.data?.pages.find((page) =>
              page.items.find((item) => item.hash === payload.dragged),
            )
          ) {
            return false
          }

          return validateReferenceDrop(payload)
        }}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'branch' }, ({ dragged }) => {
              triggerInteraction(mergeBranch(dragged))
            })
            .with({ type: 'tag' }, ({ dragged }) => {
              triggerInteraction(mergeTag(dragged))
            })
            .with({ type: 'commit' }, ({ dragged }) => {
              triggerInteraction(mergeCommit(dragged))
            })
            .exhaustive()
        }}
      />
    </>
  )
}

export { GraphDropAreas }
