import * as Ariakit from '@ariakit/react'
import { IconArchive } from '@tabler/icons-react'
import { type ComponentProps, memo } from 'react'

import type { StashInfo } from '@api/models'
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
          {...propsWithCn(divProps, 'border-1 border-solid border-transparent')}
        />
      }
    >
      <div className={cn('min-w-0 w-full')}>
        <div
          className={cn('flex flex-row gap-x-1 items-center text-light-600')}
        >
          <Icon Glyph={IconArchive} size="md" />

          <Marquee className={cn('text-sm')} reverse={false}>
            {item.name} - on{' '}
            <span className={cn('text-light-400')}>{item.createdOn}</span>{' '}
          </Marquee>
        </div>

        <Marquee
          className={cn('text-xs text-light-950', !item.message && 'italic')}
          reverse={false}
        >
          {item.message ?? 'No description'}
        </Marquee>

        <Marquee
          className={cn('text-xs text-light-950/60 mt-2')}
          reverse={false}
        >
          Stashed {stashedTime}
        </Marquee>
      </div>

      <div className={cn('h-full flex flex-col justify-between items-end')}>
        <StashToolbar stash={item} size="sm" />

        <div className={cn('text-xs text-light-950/60 text-nowrap')}>
          {item.changes?.filesCount} files - +{item.changes?.insertions} - -
          {item.changes?.deletions}
        </div>
      </div>
    </Ariakit.CompositeItem>
  )
})

export { StashesListItem, type StashesListItemProps }
