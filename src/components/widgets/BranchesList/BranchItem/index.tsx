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
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { useMergeBranch } from '@/api/mutations/merge'
import { usePullBranch, useRebaseBranch } from '@/api/mutations/pullBranch'
import { useForcePushBranch, usePushBranch } from '@/api/mutations/pushBranch'
import { useRemoveBranch } from '@/api/mutations/removeBranch'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { InteractionHandler } from '@/lib/InteractionHandler'
import { useSelectedBranches } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface BranchesListItemProps extends ListItemProps {
  branch: BranchInfo
}

/**
 * The list item for branches in the branches widget.
 *
 * Uses {@link Marquee}s to display long branch names.
 */
const BranchesListItem = (props: BranchesListItemProps) => {
  const { branch, ...itemProps } = props

  const lastModified = useDateDifference(branch.timestamp)

  const remoteCounterpart = useSelectedUpstream(branch)
  const { currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && branch.name === currentBranch.name

  const interactions = useInteractions(branch)

  return (
    <InteractionHandler
      interactions={interactions}
      render={
        <ListItem
          interactive
          aria-current={isCurrentBranch}
          {...propsWithCn(itemProps, 'text-start')}
        />
      }
    >
      <div className={cn('flex flex-row gap-x-1 items-center text-light-600')}>
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
    </InteractionHandler>
  )
}

const useInteractions = (branch: BranchInfo) => {
  const { currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && branch.name === currentBranch.name

  const checkout = useCheckoutBranch(branch)
  const fastForward = useFastForwardBranch(branch)
  const pull = usePullBranch(branch)
  const rebase = useRebaseBranch(branch)
  const push = usePushBranch(branch)
  const forcePush = useForcePushBranch(branch)
  const remove = useRemoveBranch(branch)
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
      interaction({ action: forcePush }),
    ],
    interaction({
      action: tag,
      argsRequester: () => requestTagParams(branch.name),
    }),
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

  const forRemove = group(
    !isCurrentBranch &&
      interaction({
        action: remove,
      }),
  )

  return match(branch.type)
    .with('local', () => [forLocal1, forLocal2, forRemove])
    .with('remote', () => [forRemote, forRemove])
    .exhaustive()
}

export { BranchesListItem, type BranchesListItemProps }
