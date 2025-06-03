import { IconFileAlert } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { UnmergedFileInfo } from '@api/models'
import type { ListItemProps } from '@ui/ListItem'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface UnmergedFileStatusItemProps extends ListItemProps {
  /**
   * Information about the unmerged file to display.
   */
  item: UnmergedFileInfo
}

/**
 * The list item for files in the 'unmerged' file statuses widget section.
 */
const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { item, ...itemProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(itemProps, 'text-light-600')}
      item={item}
      fileType="unmerged"
      Glyph={IconFileAlert}
      statusMessage={
        <p className={cn('text-xs text-warning-400/50')}>
          {match(item.changes)
            .with('addedByThem', () => 'Added by incoming changes')
            .with('addedByUs', () => 'Added by local changes')
            .with('bothAdded', () => 'Added by local and incoming changes')
            .with('deletedByThem', () => 'Deleted by incoming changes')
            .with('deletedByUs', () => 'Deleted by local changes')
            .with('bothDeleted', () => 'Deleted by local and incoming changes')
            .with(
              'bothModified',
              () => 'Modified by local and incoming changes',
            )
            .exhaustive()}
        </p>
      }
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
