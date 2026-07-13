import {
  IconGitBranch,
  IconLocationFilled,
  IconWorld,
  IconWorldQuestion,
} from '@tabler/icons-react'
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
import { Chip } from '@/ui/Chip'
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
        onActivate={() => {
          if (branch.type === 'remote') {
            triggerInteraction(branchOff)
          } else if (!isCurrentBranch) {
            triggerInteraction(checkout)
          }
        }}
        onDelete={isCurrentBranch ? undefined : deleteBranch}
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
                className={cn('text-primary-300')}
              />
            )}
          </div>

          <div
            className={cn(
              'flex flex-row items-center gap-1.5 mt-1',
              'text-nowrap overflow-hidden text-ellipsis',
            )}
          >
            <Chip
              size="xs"
              rounded={false}
              className={cn('text-2xs font-semibold uppercase')}
            >
              {match(branch.type)
                .with('local', () => 'Local')
                .with('remote', () => 'Remote')
                .exhaustive()}
            </Chip>

            {remoteCounterpart ? (
              <Chip
                size="xs"
                rounded={false}
                status="primary"
                className={cn('flex flex-row items-center gap-1')}
              >
                <Icon Glyph={IconWorld} size="xs" />
                <Marquee
                  className={cn('text-xs tracking-wide')}
                  reverse={false}
                >
                  {remoteCounterpart.remote}/{remoteCounterpart.remoteBranch}
                </Marquee>
              </Chip>
            ) : (
              branch.type === 'local' && (
                <Chip
                  size="xs"
                  rounded={false}
                  className={cn('flex flex-row items-center gap-1')}
                >
                  <Icon Glyph={IconWorldQuestion} size="xs" />
                  Not tracking
                </Chip>
              )
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
