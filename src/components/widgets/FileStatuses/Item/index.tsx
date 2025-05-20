import * as Ariakit from '@ariakit/react'
import type { ComponentProps, ComponentType, ReactNode } from 'react'

import type { FileType, FileTypes } from '@api/models'
import { StagedFileToolbar } from '@common/FileToolbar/Staged'
import { UnmergedFileToolbar } from '@common/FileToolbar/Unmerged'
import { UnstagedFileToolbar } from '@common/FileToolbar/Unstaged'
import { UntrackedFileToolbar } from '@common/FileToolbar/Untracked'
import { type Glyph, Icon } from '@ui/Icon'
import { ListItem } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import type { ToolbarProps } from '@ui/Toolbar'
import { cn } from '@utils/styles'

interface FileStatusItemProps<T extends FileType>
  extends ComponentProps<'div'> {
  item: FileTypes[T]
  type: T
  statusMessage?: ReactNode
  Glyph: Glyph
}

const FileStatusItem = <T extends FileType>(props: FileStatusItemProps<T>) => {
  const { item, type, statusMessage, Glyph, ...divProps } = props
  const FileToolbar: ToolbarComponent<T> = FileItemToolbar[type]

  return (
    <Ariakit.CompositeItem render={<ListItem {...divProps} />}>
      <div className={cn('min-w-0 w-full')}>
        <div className={cn('flex flex-row gap-x-1 items-center')}>
          <Icon Glyph={Glyph} size="md" />

          <Marquee className={cn('text-sm')}>{item.path}</Marquee>
        </div>

        {statusMessage}
      </div>

      <FileToolbar file={item} size="sm" />
    </Ariakit.CompositeItem>
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
