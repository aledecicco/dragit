import type { ComponentProps, ComponentType, HTMLProps } from 'react'

import { useAddToIndex, useRemoveFromIndex } from '@api/commands'
import type { FileInfo } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { ScrollShadowDiv } from '@lib/ScrollShadowDiv'
import {
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
} from '@tabler/icons-react'
import { Accordion } from '@ui/Accordion'
import { IconButton } from '@ui/IconButton'
import { mapOr } from '@utils/array'
import { useVirtualList } from '@utils/performance'
import { cn, propsWithCn } from '@utils/styles'
import { getFilesByStatus } from '@widgets/FileStatuses/utils'
import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'

interface FileStatusesProps extends ComponentProps<'div'> {}

const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props
  const headInfo = useRepositoryQuery(headInfoQuery)

  const stage = useAddToIndex()
  const unstage = useRemoveFromIndex()

  if (!headInfo.data) {
    return (
      <div
        {...propsWithCn(
          divProps,
          'h-full bg-dark-500',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950')}>Loading files...</p>
      </div>
    )
  }

  const files = getFilesByStatus(headInfo.data)

  return (
    <Accordion
      {...propsWithCn(divProps, 'overflow-hidden')}
      showArrows
      sections={[
        {
          id: 'untracked',
          label: <>Untracked files ({files.untracked.length})</>,
          extraInfo: (
            <IconButton
              round={false}
              Glyph={IconPlaylistAdd}
              variant="neutral"
              label="Start tracking all"
              size="sm"
              disabled={files.untracked.length === 0 || stage.isPending}
              onClick={() => {
                stage.mutate(files.untracked.map((file) => file.path))
              }}
            />
          ),
          description: files.untracked.length ? (
            <FileStatusesSection
              files={files.untracked}
              Item={UntrackedFileStatusItem}
            />
          ) : (
            <p className={cn('text-sm text-light-950')}>No untracked files</p>
          ),
          className: 'min-h-30',
        },
        {
          id: 'unmerged',
          label: <>Unmerged changes ({files.unmerged.length})</>,
          extraInfo: (
            <IconButton
              round={false}
              Glyph={IconListCheck}
              label="Mark all as resolved"
              variant="neutral"
              size="sm"
              disabled={files.unmerged.length === 0 || stage.isPending}
              onClick={() => {
                stage.mutate(files.unmerged.map((file) => file.path))
              }}
            />
          ),
          description: files.unmerged.length ? (
            <FileStatusesSection
              files={files.unmerged}
              Item={UnmergedFileStatusItem}
            />
          ) : (
            <p className={cn('text-sm text-light-950')}>No unmerged files</p>
          ),
          className: 'min-h-30',
        },
        {
          id: 'unstaged',
          label: <>Unstaged changes ({files.unstaged.length})</>,
          extraInfo: (
            <IconButton
              round={false}
              Glyph={IconPlaylistAdd}
              variant="neutral"
              label="Stage all"
              size="sm"
              disabled={files.unstaged.length === 0 || stage.isPending}
              onClick={() => {
                stage.mutate(files.unstaged.map((file) => file.path))
              }}
            />
          ),
          description: files.unstaged.length ? (
            <FileStatusesSection
              files={files.unstaged}
              Item={UnstagedFileStatusItem}
            />
          ) : (
            <p className={cn('text-sm text-light-950')}>No unstaged files</p>
          ),
          className: 'min-h-30',
        },
        {
          id: 'staged',
          label: <>Staged changes ({files.staged.length})</>,
          extraInfo: (
            <IconButton
              round={false}
              Glyph={IconPlaylistX}
              label="Unstage all"
              variant="neutral"
              size="sm"
              disabled={files.staged.length === 0 || unstage.isPending}
              onClick={() => {
                unstage.mutate(files.staged.map((file) => file.path))
              }}
            />
          ),
          description: files.staged.length ? (
            <FileStatusesSection
              files={files.staged}
              Item={StagedFileStatusItem}
            />
          ) : (
            <p className={cn('text-sm text-light-950')}>No staged files</p>
          ),
          className: 'min-h-30',
        },
      ]}
    />
  )
}

interface FileStatusesSectionProps<T extends FileInfo> {
  files: T[]
  Item: ComponentType<HTMLProps<HTMLDivElement> & { file: T }>
}

const FileStatusesSection = <T extends FileInfo>(
  props: FileStatusesSectionProps<T>,
) => {
  const { files, Item } = props

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList<HTMLDivElement>({
      estimateSize: () => 48,
      paddingStart: 8,
      paddingEnd: 8,
      gap: 8,
      count: files.length,
    })

  return (
    <ScrollShadowDiv
      isScrolled={isScrolled}
      hasScrollLeft={hasScrollLeft}
      className={cn('w-full h-full')}
    >
      <div
        ref={scrollContainerRef}
        className={cn('overflow-auto w-full h-full')}
      >
        <div
          className={cn('w-full relative')}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <Item
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              key={virtualRow.index}
              file={files[virtualRow.index]}
              className={cn('absolute top-0 left-2 right-2')}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </ScrollShadowDiv>
  )
}

export { FileStatuses, type FileStatusesProps }
