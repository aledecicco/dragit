import { IconArchive, IconGitBranch } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useApplyStash, useDiscardStash } from '@/api/mutations'
import { ChangesSummary } from '@/common/DiffSummary'
import { StashToolbar } from '@/common/StashToolbar'
import { withContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
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
const StashesListItem = withContextMenu<StashesListItemProps>(
  (props) => {
    const { stash, ...itemProps } = props
    const stashedTime = useDateDifference(stash.timestamp)

    return (
      <ListItem
        {...propsWithCn(
          itemProps,
          'flex-col justify-between',
          'border-1 border-solid border-transparent',
        )}
      >
        <div
          className={cn(
            'min-w-0 w-full',
            'flex flex-row justify-between items-start gap-x-2',
          )}
        >
          <div className={cn('w-full overflow-hidden')}>
            <div
              className={cn(
                'flex flex-row gap-x-1 items-center text-light-600',
              )}
            >
              <Icon Glyph={IconArchive} size="md" />

              <Marquee className={cn('text-sm')} reverse={false}>
                #{stash.id} -{' '}
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

          <StashToolbar stash={stash} size="sm" />
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
    )
  },
  ({ stash }) => {
    const apply = useApplyStash(stash)
    const discard = useDiscardStash(stash)
    return [apply, discard]
  },
)

export { StashesListItem, type StashesListItemProps }
