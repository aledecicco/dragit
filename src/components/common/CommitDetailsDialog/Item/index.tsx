import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import type { CommitedFileInfo } from '@api/models'
import { ListItem } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import { cn } from '@utils/styles'
import { match } from 'ts-pattern'

interface CommitDetailsDialogItemProps extends ComponentProps<'div'> {
  item: CommitedFileInfo
}

const CommitDetailsDialogItem = (props: CommitDetailsDialogItemProps) => {
  const { item, ...divProps } = props

  return (
    <Ariakit.CompositeItem render={<ListItem {...divProps} />}>
      <div className={cn('min-w-0 w-full')}>
        <div className={cn('flex flex-row gap-x-1 items-center')}>
          <Marquee className={cn('text-sm text-light-600')} reverse>
            {item.path}
          </Marquee>
        </div>

        <p
          className={cn(
            'text-xs',
            item.status === 'deleted'
              ? 'text-danger-300/50'
              : 'text-success-300/50',
          )}
        >
          {match(item.status)
            .with('added', () => 'Created')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('copied', () => 'Copied')
            .with('renamed', () => 'Renamed')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      </div>
    </Ariakit.CompositeItem>
  )
}

export { CommitDetailsDialogItem, type CommitDetailsDialogItemProps }
