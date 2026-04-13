import { IconGitBranch, IconLocationFilled } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo } from '@/api/models'
import { useCheckoutBranch } from '@/api/mutations/checkout'
import {
  useBranchOff,
  useCreateBranchAt,
  useTrackBranch,
} from '@/api/mutations/createBranch'
import { useTagBranch } from '@/api/mutations/createTag'
import { useDeleteBranch } from '@/api/mutations/deleteBranches'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { useMergeBranch } from '@/api/mutations/merge'
import { usePullBranch, useRebaseBranch } from '@/api/mutations/pullBranch'
import { useForcePushBranch, usePushBranch } from '@/api/mutations/pushBranch'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractionHandler } from '@/lib/InteractionHandler'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { runAction } from '@/state/actions'
import { useSelectedUpstream } from '@/state/upstream'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { useCurrentBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

interface BranchesListItemProps extends MultiSelectItemProps {
  /**
   * The branch that this list item should display.
   */
  branch: BranchInfo
}

/**
 * The list item for branches in the branches widget.
 */
const BranchesListItem = (props: BranchesListItemProps) => {
  const { branch, ...itemProps } = props

  const lastModified = useDateInfo(branch.timestamp)

  const remoteCounterpart = useSelectedUpstream(branch)
  const isCurrentBranch = useCurrentBranch()?.name === branch.name

  const interactions = useInteractions(branch)

  const checkout = useCheckoutBranch(branch)

  return (
    <Draggable
      dragPayload={{
        type: 'branch',
        dragged: branch,
        label: branch.name,
        Glyph: IconGitBranch,
      }}
    >
      <InteractionHandler
        interactions={interactions}
        render={
          <MultiSelectItem
            aria-current={isCurrentBranch}
            {...itemProps}
            onDoubleClick={(e) => {
              itemProps.onDoubleClick?.(e)
              if (!isCurrentBranch) {
                runAction(checkout)
              }
            }}
          />
        }
      >
        <div className={cn('w-full text-start')}>
          <div
            className={cn('flex flex-row gap-x-1 items-center text-light-600')}
          >
            <Icon Glyph={IconGitBranch} size="md" />

            <Marquee className={cn('text-sm')}>{branch.name}</Marquee>

            {isCurrentBranch && (
              <Icon
                Glyph={IconLocationFilled}
                size="sm"
                className={cn('text-accent-400/90')}
              />
            )}
          </div>

          <div
            className={cn(
              'text-xs text-light-950',
              'text-nowrap overflow-hidden text-ellipsis',
              'flex flex-row gap-1',
            )}
          >
            {match(branch.type)
              .with('local', () => 'Local branch')
              .with('remote', () => 'Remote branch')
              .exhaustive()}
            {remoteCounterpart && (
              <>
                , tracking{' '}
                <Marquee className={cn('text-light-400')} reverse={false}>
                  {remoteCounterpart.remote}/{remoteCounterpart.remoteBranch}
                </Marquee>
              </>
            )}
          </div>
          <p
            className={cn(
              'text-xs text-light-950/60 mt-2',
              'text-nowrap overflow-hidden text-ellipsis',
            )}
          >
            Last modified {lastModified}
          </p>
        </div>
      </InteractionHandler>
    </Draggable>
  )
}

const useInteractions = (branch: BranchInfo) => {
  const isCurrentBranch = useCurrentBranch()?.name === branch.name

  const checkout = useCheckoutBranch(branch)
  const fastForward = useFastForwardBranch(branch)
  const pull = usePullBranch(branch)
  const rebase = useRebaseBranch(branch)
  const push = usePushBranch(branch)
  const forcePush = useForcePushBranch(branch)
  const deleteBranch = useDeleteBranch(branch)
  const createBranch = useCreateBranchAt(branch.name)
  const branchOff = useBranchOff(branch.name)
  const merge = useMergeBranch(branch)
  const track = useTrackBranch(branch)
  const tag = useTagBranch(branch)

  const forLocal1 = group(
    !isCurrentBranch && interaction({ action: checkout }),
    interaction({ action: isCurrentBranch ? pull : fastForward }),
    isCurrentBranch && [
      interaction({ action: rebase }),
      interaction({ action: push }),
      interaction({ action: forcePush, isDangerous: true }),
    ],
  )

  const forLocal2 = group(
    interaction({
      action: createBranch,
      argsRequester: () => requestBranchName(branch.name),
    }),
    interaction({
      action: branchOff,
      argsRequester: () => requestBranchName(branch.name),
    }),
    interaction({
      action: tag,
      argsRequester: () => requestTagParams(branch.name),
    }),
    !isCurrentBranch && interaction({ action: merge }),
  )

  const forRemote = group(
    interaction({
      action: track,
      argsRequester: () =>
        requestBranchName(branch.name, branch.name.split('/').at(-1)),
    }),
    interaction({
      action: tag,
      argsRequester: () => requestTagParams(branch.name),
    }),
  )

  const forDelete = group(
    !isCurrentBranch &&
      interaction({
        action: deleteBranch,
        isDangerous: true,
      }),
  )

  return match(branch.type)
    .with('local', () => [forLocal1, forLocal2, forDelete])
    .with('remote', () => [forRemote, forDelete])
    .exhaustive()
}

export { BranchesListItem, type BranchesListItemProps }
