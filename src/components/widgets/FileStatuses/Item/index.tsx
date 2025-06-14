import type { ReactNode } from 'react'
import { match } from 'ts-pattern'

import type { FileInfo } from '@/api/models'
import { StagedFileToolbar } from '@/common/FileToolbar/Staged'
import { UnmergedFileToolbar } from '@/common/FileToolbar/Unmerged'
import { UnstagedFileToolbar } from '@/common/FileToolbar/Unstaged'
import { UntrackedFileToolbar } from '@/common/FileToolbar/Untracked'
import { type Glyph, Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

interface FileStatusItemProps extends ListItemProps {
  /**
   * The file to display.
   */
  file: FileInfo

  /**
   * An optional extra message to display below the file path.
   */
  statusMessage?: ReactNode

  /**
   * The icon to display for the file.
   */
  Glyph: Glyph
}

/**
 * Base list item for files in the different file statuses widget sections.
 *
 * Includes the appropriate toolbar to manipulate the file.
 *
 * Uses {@link Marquee}s to display long paths.
 */
const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, statusMessage, Glyph, ...itemProps } = props

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

          <Marquee className={cn('text-sm')}>{file.path}</Marquee>
        </div>

        {statusMessage}
      </div>

      {match(file)
        .with({ status: 'staged' }, (file) => (
          <StagedFileToolbar file={file} size="sm" />
        ))
        .with({ status: 'unstaged' }, (file) => (
          <UnstagedFileToolbar file={file} size="sm" />
        ))
        .with({ status: 'unmerged' }, (file) => (
          <UnmergedFileToolbar file={file} size="sm" />
        ))
        .with({ status: 'untracked' }, (file) => (
          <UntrackedFileToolbar file={file} size="sm" />
        ))
        .exhaustive()}
    </ListItem>
  )
}

export { FileStatusItem, type FileStatusItemProps }
