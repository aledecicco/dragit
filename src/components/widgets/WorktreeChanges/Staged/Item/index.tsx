import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { FileOfType } from '@/api/models'
import { FilePath } from '@/common/FilePath'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn } from '@/utils/styles'

import type { STAGED_FILE_TYPES } from '..'
import { StagedFileContextMenu } from './Menu'

interface StagedChangesItemProps extends ListItemProps {
  /**
   * Information about the staged file to display.
   */
  file: FileOfType<(typeof STAGED_FILE_TYPES)[number]>
}

/**
 * The list item for files in the 'staged' file statuses widget section.
 */
const StagedChangesItem = (props: StagedChangesItemProps) => {
  const { file, ...itemProps } = props

  const Glyph = match(file)
    .with({ status: 'staged' }, (file) =>
      match(file.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .with('copied', () => IconFiles)
        .with('renamed', () => IconFileArrowRight)
        .exhaustive(),
    )
    .exhaustive()

  const { filedir, filename } = getPathLocation(file.path)

  return (
    <ContextMenu items={<StagedFileContextMenu file={file} />}>
      <ListItem
        interactive
        {...itemProps}
        onClick={(e) => {
          itemProps.onClick?.(e)
          showWorktreeFileDiffDialog(file)
        }}
      >
        <div className={cn('w-full flex flex-col items-start')}>
          <div className={cn('flex flex-row gap-x-1 items-center min-w-0')}>
            <Icon
              Glyph={Glyph}
              size="md"
              className={cn(
                match(file)
                  .with({ status: 'staged' }, (file) =>
                    match(file.changes)
                      .with('added', () => 'text-success-200/90')
                      .with('deleted', () => 'text-danger-200/90')
                      .with('modified', () => 'text-success-200/90')
                      .with('typeChanged', () => 'text-light-400')
                      .with('copied', () => 'text-light-400')
                      .with('renamed', () => 'text-light-400')
                      .exhaustive(),
                  )
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
    </ContextMenu>
  )
}

export { StagedChangesItem, type StagedChangesItemProps }
