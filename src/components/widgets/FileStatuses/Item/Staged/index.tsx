import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { StagedFileInfo } from '@api/models'
import type { ListItemProps } from '@ui/ListItem'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface StagedFileStatusItemProps extends ListItemProps {
  /**
   * Information about the staged file to display.
   */
  item: StagedFileInfo
}

/**
 * The list item for files in the 'staged' file statuses widget section.
 */
const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { item, ...itemProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(itemProps, 'text-light-600')}
      item={item}
      fileType="staged"
      statusMessage={
        <p className={cn('text-xs text-success-300/50')}>
          {match(item.changes)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('copied', () => 'Copied')
            .with('renamed', () => 'Renamed')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('copied', () => IconFiles)
        .with('renamed', () => IconFileArrowRight)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
