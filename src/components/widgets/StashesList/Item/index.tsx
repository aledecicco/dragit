import * as Ariakit from '@ariakit/react'
import { IconArchive, IconGitBranch } from '@tabler/icons-react'
import { type ComponentProps, memo } from 'react'

import type { StashInfo } from '@api/models'
import { ChangesSummary } from '@common/DiffSummary'
import { StashToolbar } from '@common/StashToolbar'
import { Icon } from '@ui/Icon'
import { ListItem } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import { cn, propsWithCn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

interface StashesListItemProps extends ComponentProps<'div'> {
  item: StashInfo
}

const StashesListItem = memo((props: StashesListItemProps) => {
  const { item, ...divProps } = props
  const stashedTime = useDateDifference(item.timestamp)

  return (
    <Ariakit.CompositeItem
      render={
        <ListItem
          {...propsWithCn(
            divProps,
            'flex-col justify-between',
            'border-1 border-solid border-transparent',
          )}
        />
      }
    >
      <div
        className={cn(
          'min-w-0 w-full',
          'flex flex-row justify-between items-start gap-x-2',
        )}
      >
        <div className={cn('w-full overflow-hidden')}>
          <div
            className={cn('flex flex-row gap-x-1 items-center text-light-600')}
          >
            <Icon Glyph={IconArchive} size="md" />

            <Marquee className={cn('text-sm')} reverse={false}>
              #{item.id} -{' '}
              <span className={cn('text-light-950')}>
                <Icon
                  Glyph={IconGitBranch}
                  size="sm"
                  className={cn('inline-block')}
                />{' '}
                {item.createdOn}
              </span>
            </Marquee>
          </div>

          <Marquee
            className={cn('text-xs text-light-950', !item.message && 'italic')}
            reverse={false}
          >
            {item.message ?? 'No description'}
          </Marquee>
        </div>

        <StashToolbar stash={item} size="sm" />
      </div>

      <div
        className={cn(
          'min-w-0 w-full mt-2',
          'flex flex-row justify-between items-end gap-x-2',
        )}
      >
        <Marquee className={cn('text-xs text-light-950/60')} reverse={false}>
          Stashed {stashedTime}
        </Marquee>

        <Marquee className={cn('text-xs')} reverse={false}>
          {item.changes ? (
            <ChangesSummary diff={item.changes} />
          ) : (
            <span className={cn('text-light-950')}>Untracked changes</span>
          )}
        </Marquee>
      </div>
    </Ariakit.CompositeItem>
  )
})

export { StashesListItem, type StashesListItemProps }
