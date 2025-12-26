import type { FileOfType } from '@/api/models'
import { FileIcon } from '@/common/File/Icon'
import { FilePath } from '@/common/File/Path'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
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

  const { filedir, filename } = getPathLocation(file.path)

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
            <FileIcon file={file} />

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

export { UnstagedChangesItem, type UnstagedChangesItemProps }
