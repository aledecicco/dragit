import {
  IconFileAlert,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFileUnknown,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { FileOfType } from '@/api/models'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation, splitPath } from '@/utils/string'
import { cn } from '@/utils/styles'

import type { UNSTAGED_FILE_TYPES } from '..'
import { UnstagedFileContextMenu } from './Menu'

interface UnstagedChangesItemProps extends ListItemProps {
  /**
   * Information about the unstaged file to display.
   */
  file: FileOfType<(typeof UNSTAGED_FILE_TYPES)[number]>
}

/**
 * The list item for files in the 'unstaged' file statuses widget section.
 */
const UnstagedChangesItem = (props: UnstagedChangesItemProps) => {
  const { file, ...itemProps } = props

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

  const [filedir, filename] = getPathLocation(file.path)

  return (
    <ContextMenu items={<UnstagedFileContextMenu file={file} />}>
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
            />

            <Marquee className={cn('text-sm text-light-500')}>
              {filename}
            </Marquee>
          </div>

          <Marquee className={cn('text-xs text-light-900/80')}>
            {splitPath(filedir).map((segment, i, all) => (
              <span key={`${i + 1}`}>
                {segment}

                {i < all.length - 1 && (
                  <span className={cn('text-light-700 mx-px')}>/</span>
                )}
              </span>
            ))}
          </Marquee>
        </div>
      </ListItem>
    </ContextMenu>
  )
}

export { UnstagedChangesItem, type UnstagedChangesItemProps }
