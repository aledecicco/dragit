import * as Ariakit from '@ariakit/react'
import { memo } from 'react'
import { match } from 'ts-pattern'

import type { CommitedFileInfo } from '@api/models'
import { ListItem, type ListItemProps } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import { cn, propsWithCn } from '@utils/styles'

interface CommitDetailsDialogItemProps extends ListItemProps {
  /**
   * The file that this list item should display.
   */
  item: CommitedFileInfo
}

/**
 * The list item for files in the commit details dialog.
 *
 * Displays as a checkbox to allow selecting/unselecting files.
 */
const CommitDetailsDialogItem = memo((props: CommitDetailsDialogItemProps) => {
  const { item, ...itemProps } = props

  return (
    <Ariakit.Checkbox
      value={item.path}
      render={
        <ListItem
          interactive
          {...propsWithCn(
            itemProps,
            'flex flex-col items-start',
            'border-1 border-solid border-transparent',
            'aria-checked:border-accent-300',
          )}
        >
          <Marquee className={cn('text-sm text-light-600')} reverse>
            {item.path}
          </Marquee>

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
        </ListItem>
      }
    />
  )
})

export { CommitDetailsDialogItem, type CommitDetailsDialogItemProps }
