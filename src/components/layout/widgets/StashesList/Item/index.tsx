import { IconArchive, IconGitBranch } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useApplyStash } from '@/api/mutations/applyStash'
import { useDiscardStash } from '@/api/mutations/discardStashes'
import { ChangesSummary } from '@/common/DiffSummary'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

interface StashesListItemProps extends MultiSelectItemProps {
  /**
   * The stash that this list item should display.
   */
  stash: StashInfo
}

/**
 * The list item for stashes in the stashes widget.
 */
const StashesListItem = (props: StashesListItemProps) => {
  const { stash, ...itemProps } = props

  const stashedTime = useDateInfo(stash.timestamp)
  const interactions = useInteractions(stash)

  return (
    <Draggable
      dragPayload={{
        type: 'stash',
        dragged: stash,
        label: `Stash #${stash.stashNumber}`,
        Glyph: IconArchive,
      }}
    >
      <InteractiveItem
        interactions={interactions}
        activationAction={() => {
          showSnapshotDetailsDialog(stash)
        }}
        render={<MultiSelectItem {...itemProps} />}
      >
        <div className={cn('flex flex-col justify-between')}>
          <div className={cn('min-w-0 w-full overflow-hidden')}>
            <div
              className={cn(
                'flex flex-row gap-x-1 items-center text-light-600',
              )}
            >
              <Icon Glyph={IconArchive} size="md" />

              <Marquee className={cn('text-sm')} reverse={false}>
                #{stash.stashNumber} -{' '}
                <span className={cn('text-light-950')}>
                  <Icon
                    Glyph={IconGitBranch}
                    size="sm"
                    className={cn('inline-block')}
                  />{' '}
                  {stash.createdOn}
                </span>
              </Marquee>
            </div>

            <Marquee
              className={cn(
                'text-xs text-light-950',
                !stash.message && 'italic',
              )}
              reverse={false}
            >
              {stash.message ?? 'No description'}
            </Marquee>
          </div>

          <div
            className={cn(
              'min-w-0 w-full mt-2',
              'flex flex-row justify-between items-end gap-x-2',
            )}
          >
            <p
              className={cn(
                'text-xs text-light-950/60',
                'text-nowrap overflow-hidden text-ellipsis',
              )}
            >
              Stashed {stashedTime}
            </p>

            <Marquee className={cn('text-xs')} reverse={false}>
              {stash.changes ? (
                <ChangesSummary diff={stash.changes} />
              ) : (
                <span className={cn('text-light-950')}>Untracked changes</span>
              )}
            </Marquee>
          </div>
        </div>
      </InteractiveItem>
    </Draggable>
  )
}

const useInteractions = (stash: StashInfo) => {
  const apply = useApplyStash(stash)
  const discard = useDiscardStash(stash)

  return [
    group(interaction({ action: apply })),
    group(
      interaction({
        action: discard,
        isDangerous: true,
        details: `discard stash #${stash.stashNumber}`,
      }),
    ),
  ]
}

export { StashesListItem, type StashesListItemProps }
