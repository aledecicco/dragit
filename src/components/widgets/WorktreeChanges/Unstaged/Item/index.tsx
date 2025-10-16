import type { ComponentProps } from 'react'
import {
  IconEye,
  IconFileAlert,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFileUnknown,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { FileOfType } from '@/api/models'
import { useStageFile } from '@/api/mutations'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { MenuItem } from '@/ui/Menu/Item'
import { cn, propsWithCn } from '@/utils/styles'

import type { FILE_TYPES } from '..'

interface UnstagedChangesItemProps extends ListItemProps {
  /**
   * Information about the unstaged file to display.
   */
  file: FileOfType<(typeof FILE_TYPES)[number]>

  /**
   * Additional props for the container element.
   */
  containerProps?: ComponentProps<'div'>
}

/**
 * The list item for files in the 'unstaged' file statuses widget section.
 */
const UnstagedChangesItem = (props: UnstagedChangesItemProps) => {
  const { file, containerProps, ...itemProps } = props

  const Glyph = match(file)
    .with({ status: 'unstaged' }, (file) =>
      match(file.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive(),
    )
    .with({ status: 'untracked' }, () => IconFileUnknown)
    .with({ status: 'unmerged' }, () => IconFileAlert)
    .exhaustive()

  const statusMessage = match(file)
    .with({ status: 'unstaged' }, (file) =>
      match(file.changes)
        .with('added', () => 'New')
        .with('deleted', () => 'Deleted')
        .with('modified', () => 'Edited')
        .with('typeChanged', () => 'Converted')
        .exhaustive(),
    )
    .with({ status: 'untracked' }, () => 'Untracked')
    .with({ status: 'unmerged' }, (file) =>
      match(file.changes)
        .with('addedByUs', () => 'Conflict - Added by us')
        .with('addedByThem', () => 'Conflict - Added by them')
        .with('deletedByUs', () => 'Conflict - Deleted by us')
        .with('deletedByThem', () => 'Conflict - Deleted by them')
        .with('bothAdded', () => 'Conflict - Both added')
        .with('bothDeleted', () => 'Conflict - Both deleted')
        .with('bothModified', () => 'Conflict - Both modified')
        .exhaustive(),
    )
    .exhaustive()

  const stage = useStageFile(file)

  return (
    <ContextMenu
      items={
        <>
          <MenuItem
            label="View changes"
            Glyph={IconEye}
            onClick={() => {
              showWorktreeFileDiffDialog(file)
            }}
          />
          <MenuItem action={stage} />
        </>
      }
    >
      <div {...containerProps}>
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
                  .with({ status: 'unstaged' }, (file) =>
                    match(file.changes)
                      .with('added', () => 'text-success-200/90')
                      .with('deleted', () => 'text-danger-200/90')
                      .with('modified', () => 'text-success-200/90')
                      .with('typeChanged', () => 'text-light-400')
                      .exhaustive(),
                  )
                  .with({ status: 'untracked' }, () => 'text-light-600')
                  .with({ status: 'unmerged' }, () => 'text-warning-100/90')
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
                  .with({ status: 'unstaged' }, (file) =>
                    match(file.changes)
                      .with('added', () => 'text-success-300/70')
                      .with('deleted', () => 'text-danger-300/70')
                      .with('modified', () => 'text-success-300/70')
                      .with('typeChanged', () => 'text-light-600')
                      .exhaustive(),
                  )
                  .with({ status: 'untracked' }, () => 'text-light-700/70')
                  .with({ status: 'unmerged' }, () => 'text-warning-200/70')
                  .exhaustive(),
              )}
            >
              {statusMessage}
            </p>
          </div>
        </ListItem>
      </div>
    </ContextMenu>
  )
}

export { UnstagedChangesItem, type UnstagedChangesItemProps }
