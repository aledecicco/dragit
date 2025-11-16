import { IconArchive, IconEye, IconGitBranch } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useApplyStash } from '@/api/mutations/applyStash'
import { useDiscardStash } from '@/api/mutations/discardStash'
import { ChangesSummary } from '@/common/DiffSummary'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface StashesListItemProps extends ListItemProps {
  /**
   * The stash that this list item should display.
   */
  stash: StashInfo
}

/**
 * The list item for stashes in the stashes widget.
 *
 * Includes a toolbar to apply or delete the stash.
 */
const StashesListItem = (props: StashesListItemProps) => {
  const { stash, ...itemProps } = props
  const stashedTime = useDateDifference(stash.timestamp)
  const apply = useApplyStash(stash)
  const discard = useDiscardStash(stash)

  return (
    <ContextMenu
      items={
        <>
          <MenuItem
            label="View"
            Glyph={IconEye}
            onClick={() => {
              showSnapshotDetailsDialog(stash)
            }}
          />
          <MenuItem action={apply} />

          <Separator />

          <MenuItem action={discard} status="error" />
        </>
      }
    >
      <ListItem
        interactive
        {...propsWithCn(
          itemProps,
          'flex flex-col justify-between',
          'border border-solid border-transparent',
        )}
        onClick={(e) => {
          itemProps.onClick?.(e)
          showSnapshotDetailsDialog(stash)
        }}
      >
        <div className={cn('min-w-0 w-full overflow-hidden')}>
          <div
            className={cn('flex flex-row gap-x-1 items-center text-light-600')}
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
            className={cn('text-xs text-light-950', !stash.message && 'italic')}
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
      </ListItem>
    </ContextMenu>
  )
}

export { StashesListItem, type StashesListItemProps }
