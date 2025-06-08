import type { ComponentType, ReactNode } from 'react'

import type { FileType, FileTypes } from '@api/models'
import { StagedFileToolbar } from '@common/FileToolbar/Staged'
import { UnmergedFileToolbar } from '@common/FileToolbar/Unmerged'
import { UnstagedFileToolbar } from '@common/FileToolbar/Unstaged'
import { UntrackedFileToolbar } from '@common/FileToolbar/Untracked'
import { type Glyph, Icon } from '@ui/Icon'
import { ListItem, type ListItemProps } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import type { ToolbarProps } from '@ui/Toolbar'
import { cn, propsWithCn } from '@utils/styles'

interface FileStatusItemProps<T extends FileType> extends ListItemProps {
  item: FileTypes[T]
  fileType: T
  statusMessage?: ReactNode
  Glyph: Glyph
}

/**
 * Base list item for files in the different file statuses widget sections.
 *
 * Includes the appropriate toolbar to manipulate the file.
 *
 * Uses {@link Marquee}s to display long paths.
 */
const FileStatusItem = <T extends FileType>(props: FileStatusItemProps<T>) => {
  const { item, fileType, statusMessage, Glyph, ...itemProps } = props

  const FileToolbar: ToolbarComponent<T> = FileItemToolbar[fileType]

  return (
    <ListItem
      {...propsWithCn(
        itemProps,
        'flex flex-row items-start justify-between gap-x-8',
      )}
    >
      <div className={cn('min-w-0 w-full')}>
        <div className={cn('flex flex-row gap-x-1 items-center')}>
          <Icon Glyph={Glyph} size="md" />

          <Marquee className={cn('text-sm')}>{item.path}</Marquee>
        </div>

        {statusMessage}
      </div>

      <FileToolbar file={item} size="sm" />
    </ListItem>
  )
}

type ToolbarComponent<T extends FileType> = ComponentType<
  { file: FileTypes[T] } & Partial<ToolbarProps>
>

const FileItemToolbar: {
  [T in FileType]: ToolbarComponent<T>
} = {
  staged: StagedFileToolbar,
  unstaged: UnstagedFileToolbar,
  unmerged: UnmergedFileToolbar,
  untracked: UntrackedFileToolbar,
}

export { FileStatusItem, type FileStatusItemProps }
