import { match } from 'ts-pattern'

import { useCheckout, useSwitchBranches } from '@/api/mutations/checkout'
import { useMakeBranchOff } from '@/api/mutations/createBranch'
import {
  useMakeMergeBranch,
  useMakeMergeCommit,
  useMakeMergeTag,
} from '@/api/mutations/merge'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { MatchingPayload } from '@/lib/DragAndDrop/utils'
import { triggerInteraction } from '@/state/actions'
import { useChangeSelectedBase, useSelectedBase } from '@/state/branches'
import { useHeadReference } from '@/utils/repository'
import { cn } from '@/utils/styles'

/**
 * Group of extra drop areas for the graph.
 */
const GraphDropAreas = () => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)
  const changeSelectedBase = useChangeSelectedBase()

  const checkout = useCheckout()
  const switchBranches = useSwitchBranches()
  const makeBranchOff = useMakeBranchOff()
  const makeMergeBranch = useMakeMergeBranch()
  const makeMergeTag = useMakeMergeTag()
  const makeMergeCommit = useMakeMergeCommit()

  const validateBranchDrop = (
    payload: MatchingPayload<'branch' | 'tag' | 'commit'>,
  ) => {
    return match(payload)
      .with(
        { type: 'commit' },
        ({ dragged }) => dragged.id !== currentReference?.refName,
      )
      .otherwise(({ dragged }) => dragged.name !== currentReference?.refName)
  }

  const validateBaseBranchDrop = (
    payload: MatchingPayload<'branch' | 'tag' | 'commit'>,
  ) => {
    return match(payload)
      .with(
        { type: 'commit' },
        ({ dragged }) => dragged.id !== baseReference?.refName,
      )
      .otherwise(({ dragged }) => dragged.name !== baseReference?.refName)
  }

  return (
    <>
      <DropArea
        className={cn('absolute top-0 left-0 w-half h-18')}
        overlayProps={(payload) => ({
          className: cn(
            'rounded-sm flex-row',
            validateBaseBranchDrop(payload) && 'rounded-r-none',
          ),
        })}
        acceptedTypes={['branch', 'tag', 'commit']}
        label={{
          branch: 'checkout this branch',
          tag: 'checkout this tag',
          commit: 'checkout this commit',
        }}
        extraValidation={validateBranchDrop}
        handleDrop={(payload) => {
          if (payload.type === 'branch' && payload.dragged.type === 'remote') {
            triggerInteraction({
              action: makeBranchOff(payload.dragged.name),
              argsRequester: () =>
                requestBranchName(
                  payload.dragged.name,
                  payload.dragged.name.split('/').at(-1),
                ),
            })
          } else {
            triggerInteraction({
              action: checkout,
              argsRequester: () => {
                const newRef = match(payload)
                  .with({ type: 'commit' }, ({ dragged }) => dragged.id)
                  .otherwise(({ dragged }) => dragged.name)

                return {
                  reference: newRef,
                  isNew: false,
                }
              },
            })
          }
        }}
      />

      <DropArea
        className={cn('absolute top-0 right-0 w-half h-18')}
        overlayProps={(payload) => ({
          className: cn(
            'rounded-sm flex-row',
            validateBranchDrop(payload) && 'rounded-l-none',
          ),
        })}
        acceptedTypes={['branch', 'tag', 'commit']}
        label={{
          branch: 'use this branch as base',
          tag: 'use this tag as base',
          commit: 'use this commit as base',
        }}
        extraValidation={validateBaseBranchDrop}
        handleDrop={(payload) => {
          if (currentReference) {
            const newRef = match(payload)
              .with({ type: 'commit' }, ({ dragged }) => dragged.shortHash)
              .otherwise(({ dragged }) => dragged.name)

            if (newRef === currentReference.refName) {
              triggerInteraction({
                action: switchBranches,
              })
            } else {
              changeSelectedBase(currentReference, {
                type: payload.type,
                refName: newRef,
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
        extraValidation={validateBranchDrop}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'branch' }, ({ dragged }) => {
              triggerInteraction({
                action: makeMergeBranch(dragged),
              })
            })
            .with({ type: 'tag' }, ({ dragged }) => {
              triggerInteraction({
                action: makeMergeTag(dragged),
              })
            })
            .with({ type: 'commit' }, ({ dragged }) => {
              triggerInteraction({
                action: makeMergeCommit(dragged.id),
              })
            })
            .exhaustive()
        }}
      />
    </>
  )
}

export { GraphDropAreas }
