import {
  IconEye,
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { FileOfType } from '@/api/models'
import { useUnstageFile } from '@/api/mutations/removeFromIndex'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { MenuItem } from '@/ui/Menu/Item'
import { cn, propsWithCn } from '@/utils/styles'

import type { STAGED_FILE_TYPES } from '..'

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

  const statusMessage = match(file)
    .with({ status: 'staged' }, (file) =>
      match(file.changes)
        .with('added', () => 'New')
        .with('deleted', () => 'Deleted')
        .with('modified', () => 'Edited')
        .with('typeChanged', () => 'Converted')
        .with('copied', () => 'Copied')
        .with('renamed', () => 'Renamed')
        .exhaustive(),
    )
    .exhaustive()

  const unstage = useUnstageFile(file)

  return (
    <ContextMenu
      items={
        <>
          <MenuItem action={unstage} />
          <MenuItem
            label="View changes"
            Glyph={IconEye}
            onClick={() => {
              showWorktreeFileDiffDialog(file)
            }}
          />
        </>
      }
    >
      <ListItem
        interactive
        {...propsWithCn(
          itemProps,
          'flex flex-row text-start items-start justify-between gap-x-8',
        )}
        onClick={(e) => {
          itemProps.onClick?.(e)
          showWorktreeFileDiffDialog(file)
        }}
      >
        <div className={cn('min-w-0 w-full')}>
          <div
            className={cn(
              'flex flex-row gap-x-1 items-center',
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
          >
            <Icon Glyph={Glyph} size="md" />
            <Marquee className={cn('text-sm')}>{file.path}</Marquee>
          </div>

          <p
            className={cn(
              'text-xs',
              match(file)
                .with({ status: 'staged' }, (file) =>
                  match(file.changes)
                    .with('added', () => 'text-success-300/70')
                    .with('deleted', () => 'text-danger-300/70')
                    .with('modified', () => 'text-success-300/70')
                    .with('typeChanged', () => 'text-light-600')
                    .with('copied', () => 'text-light-600')
                    .with('renamed', () => 'text-light-600')
                    .exhaustive(),
                )
                .exhaustive(),
            )}
          >
            {statusMessage}
          </p>
        </div>
      </ListItem>
    </ContextMenu>
  )
}

export { StagedChangesItem, type StagedChangesItemProps }
