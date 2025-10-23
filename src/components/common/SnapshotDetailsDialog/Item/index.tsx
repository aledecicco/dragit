import * as Ariakit from '@ariakit/react'
import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { VersionedFileInfo } from '@/api/models'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

interface SnapshotDetailsDialogItemProps extends ListItemProps {
  /**
   * The file that this list item should display.
   */
  file: VersionedFileInfo
}

/**
 * The list item for files in the snapshot details dialog.
 *
 * Displays as a checkbox to allow selecting/unselecting files.
 */
const SnapshotDetailsDialogItem = (props: SnapshotDetailsDialogItemProps) => {
  const { file, ...itemProps } = props
  const Glyph = match(file.changes)
    .with('added', () => IconFilePlus)
    .with('deleted', () => IconFileMinus)
    .with('modified', () => IconFilePencil)
    .with('typeChanged', () => IconFileCode2)
    .with('copied', () => IconFiles)
    .with('renamed', () => IconFileArrowRight)
    .exhaustive()

  const statusMessage = match(file.changes)
    .with('added', () => 'New')
    .with('deleted', () => 'Deleted')
    .with('modified', () => 'Edited')
    .with('typeChanged', () => 'Converted')
    .with('copied', () => 'Copied')
    .with('renamed', () => 'Renamed')
    .exhaustive()

  return (
    <Ariakit.Radio
      value={file.path}
      render={
        <ListItem
          interactive
          {...propsWithCn(
            itemProps,
            'flex flex-row text-start items-start justify-between gap-x-8',
            'border border-solid border-transparent',
            'aria-checked:border-accent-300',
          )}
        >
          <div className={cn('min-w-0 w-full')}>
            <div
              className={cn(
                'flex flex-row gap-x-1 items-center',
                match(file.changes)
                  .with('added', () => 'text-success-200/90')
                  .with('deleted', () => 'text-danger-200/90')
                  .with('modified', () => 'text-success-200/90')
                  .with('typeChanged', () => 'text-light-400')
                  .with('copied', () => 'text-light-400')
                  .with('renamed', () => 'text-light-400')
                  .exhaustive(),
              )}
            >
              <Icon Glyph={Glyph} size="md" />
              <Marquee className={cn('text-sm')}>{file.path}</Marquee>
            </div>

            <p
              className={cn(
                'text-xs',
                match(file.changes)
                  .with('added', () => 'text-success-300/70')
                  .with('deleted', () => 'text-danger-300/70')
                  .with('modified', () => 'text-success-300/70')
                  .with('typeChanged', () => 'text-light-600')
                  .with('copied', () => 'text-light-600')
                  .with('renamed', () => 'text-light-600')
                  .exhaustive(),
              )}
            >
              {statusMessage}
            </p>
          </div>
        </ListItem>
      }
    />
  )
}

export { SnapshotDetailsDialogItem, type SnapshotDetailsDialogItemProps }
