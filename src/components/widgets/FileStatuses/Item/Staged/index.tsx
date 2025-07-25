import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { StagedFileInfo } from '@/api/models'
import { useUnstageFile } from '@/api/mutations'
import { withContextMenu } from '@/lib/ContextMenu'
import type { ListItemProps } from '@/ui/ListItem'
import { cn, propsWithCn } from '@/utils/styles'

import { FileStatusItem } from '..'

interface StagedFileStatusItemProps extends ListItemProps {
  /**
   * Information about the staged file to display.
   */
  file: StagedFileInfo
}

/**
 * The list item for files in the 'staged' file statuses widget section.
 */
const StagedFileStatusItem = withContextMenu<StagedFileStatusItemProps>(
  (props) => {
    const { file, ...itemProps } = props

    return (
      <FileStatusItem
        {...propsWithCn(itemProps, 'text-light-600')}
        file={file}
        statusMessage={
          <p
            className={cn(
              'text-xs text-success-300/50',
              'text-nowrap overflow-hidden text-ellipsis',
            )}
          >
            {match(file.changes)
              .with('added', () => 'New')
              .with('deleted', () => 'Deleted')
              .with('modified', () => 'Edited')
              .with('copied', () => 'Copied')
              .with('renamed', () => 'Renamed')
              .with('typeChanged', () => 'Converted')
              .exhaustive()}
          </p>
        }
        Glyph={match(file.changes)
          .with('added', () => IconFilePlus)
          .with('deleted', () => IconFileMinus)
          .with('modified', () => IconFilePencil)
          .with('copied', () => IconFiles)
          .with('renamed', () => IconFileArrowRight)
          .with('typeChanged', () => IconFileCode2)
          .exhaustive()}
      />
    )
  },
  ({ file }) => {
    const unstage = useUnstageFile(file)
    return [unstage]
  },
)

export { StagedFileStatusItem, type StagedFileStatusItemProps }
