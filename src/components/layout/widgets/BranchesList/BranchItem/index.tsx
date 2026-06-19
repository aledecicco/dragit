import { IconGitBranch, IconLocationFilled } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo } from '@/api/models'
import {
  useBranchOffBranchInteraction,
  useCheckoutBranchInteraction,
  useDeleteBranchInteraction,
  useSingleBranchInteractions,
} from '@/interactions/branch'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { triggerInteraction } from '@/state/actions'
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

  const interactions = useSingleBranchInteractions(branch)
  const checkout = useCheckoutBranchInteraction(branch)
  const branchOff = useBranchOffBranchInteraction(branch)
  const deleteBranch = useDeleteBranchInteraction(branch)

  return (
    <Draggable
      dragPayload={{
        type: 'branch',
        dragged: branch,
        label: branch.name,
        Glyph: IconGitBranch,
      }}
    >
      <InteractiveItem
        interactions={interactions}
        activationAction={() => {
          if (branch.type === 'remote') {
            triggerInteraction(branchOff)
          } else if (!isCurrentBranch) {
            triggerInteraction(checkout)
          }
        }}
        deleteAction={() => {
          if (!isCurrentBranch) {
            triggerInteraction(deleteBranch)
          }
        }}
        render={
          <MultiSelectItem aria-current={isCurrentBranch} {...itemProps} />
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
      </InteractiveItem>
    </Draggable>
  )
}

export { BranchesListItem, type BranchesListItemProps }
