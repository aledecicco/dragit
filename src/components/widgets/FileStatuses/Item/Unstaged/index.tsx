import {
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { UnstagedFileInfo } from '@api/models'
import type { ListItemProps } from '@ui/ListItem'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

/**
 * Information about the unstaged file to display.
 */
interface UnstagedFileStatusItemProps extends ListItemProps {
  item: UnstagedFileInfo
}

/**
 * The list item for files in the 'unstaged' file statuses widget section.
 */
const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { item, ...itemProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(itemProps, 'text-light-600')}
      item={item}
      fileType="unstaged"
      statusMessage={
        <p className={cn('text-xs text-light-950')}>
          {match(item.changes)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
    />
  )
}

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
