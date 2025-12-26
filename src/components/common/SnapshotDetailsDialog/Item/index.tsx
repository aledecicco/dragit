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
import { FilePath } from '@/common/File/Path'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
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
 * Displays as a radio item to allow selecting files.
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

  const { filedir, filename } = getPathLocation(file.path)

  return (
    <Ariakit.Radio
      value={file.path}
      render={
        <ListItem
          interactive
          {...propsWithCn(
            itemProps,
            'border border-transparent',
            'aria-checked:border-accent-300',
          )}
        >
          <div className={cn('w-full flex flex-col items-start')}>
            <div className={cn('flex flex-row gap-x-1 items-center min-w-0')}>
              <Icon
                Glyph={Glyph}
                size="md"
                className={cn(
                  match(file.changes)
                    .with('added', () => 'text-success-200/90')
                    .with('deleted', () => 'text-danger-200/90')
                    .with('modified', () => 'text-success-200/90')
                    .with('typeChanged', () => 'text-light-400')
                    .with('copied', () => 'text-light-400')
                    .with('renamed', () => 'text-light-400')
                    .exhaustive(),
                )}
              />

              <Marquee className={cn('text-sm text-light-500')}>
                {filename}
              </Marquee>
            </div>

            <Marquee className={cn('text-xs text-light-900/80')}>
              <FilePath
                filepath={filedir}
                separatorProps={{ className: cn('text-light-700') }}
              />
            </Marquee>
          </div>
        </ListItem>
      }
    />
  )
}

export { SnapshotDetailsDialogItem, type SnapshotDetailsDialogItemProps }
