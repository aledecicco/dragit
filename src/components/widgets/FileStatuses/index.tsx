import * as Ariakit from '@ariakit/react'
import {
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
} from '@tabler/icons-react'
import { type ComponentProps, type ComponentType, useMemo } from 'react'

import type { FileInfo, Page } from '@api/models'
import { useAddToIndex, useRemoveFromIndex } from '@api/mutations'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn, propsWithCn } from '@utils/styles'
import {
  type FilesByStatus,
  useFilesByStatus,
} from '@widgets/FileStatuses/utils'
import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'

interface FileStatusesProps extends ComponentProps<'div'> {}

const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props

  const stage = useAddToIndex()
  const unstage = useRemoveFromIndex()

  const files = useFilesByStatus()

  if (!files) {
    return (
      <div
        {...propsWithCn(
          divProps,
          'h-full bg-dark-500',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950/60')}>
          Loading files...
        </p>
      </div>
    )
  }

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <AccordionSection
        label={`Untracked files (${files.untracked.length})`}
        extraInfo={
          <IconButton
            round={false}
            Glyph={IconPlaylistAdd}
            variant="neutral"
            label="Start tracking all"
            size="sm"
            disabled={files.untracked.length === 0 || stage.isPending}
            onClick={() => {
              stage.mutate({ files: files.untracked.map((file) => file.path) })
            }}
          />
        }
        className={'min-h-30 overflow-y-hidden'}
      >
        <FileList
          files={files}
          status="untracked"
          RenderItem={UntrackedFileStatusItem}
          itemSize={34}
        />
      </AccordionSection>

      <AccordionSection
        label={`Unmerged files (${files.unmerged.length})`}
        extraInfo={
          <IconButton
            round={false}
            Glyph={IconListCheck}
            label="Mark all as resolved"
            variant="neutral"
            size="sm"
            disabled={files.unmerged.length === 0 || stage.isPending}
            onClick={() => {
              stage.mutate({ files: files.unmerged.map((file) => file.path) })
            }}
          />
        }
        className={'min-h-30 overflow-y-hidden'}
      >
        <FileList
          files={files}
          status="unmerged"
          RenderItem={UnmergedFileStatusItem}
          itemSize={48}
        />
      </AccordionSection>

      <AccordionSection
        label={`Unstaged files (${files.unstaged.length})`}
        extraInfo={
          <IconButton
            round={false}
            Glyph={IconPlaylistAdd}
            variant="neutral"
            label="Stage all"
            size="sm"
            disabled={files.unstaged.length === 0 || stage.isPending}
            onClick={() => {
              stage.mutate({ files: files.unstaged.map((file) => file.path) })
            }}
          />
        }
        className={'min-h-30 overflow-y-hidden'}
      >
        <FileList
          files={files}
          status="unstaged"
          RenderItem={UnstagedFileStatusItem}
          itemSize={48}
        />
      </AccordionSection>

      <AccordionSection
        label={`Staged files (${files.staged.length})`}
        extraInfo={
          <IconButton
            round={false}
            Glyph={IconPlaylistX}
            label="Unstage all"
            variant="neutral"
            size="sm"
            disabled={files.staged.length === 0 || unstage.isPending}
            onClick={() => {
              unstage.mutate({ files: files.staged.map((file) => file.path) })
            }}
          />
        }
        className={'min-h-30 overflow-y-hidden'}
      >
        <FileList
          files={files}
          status="staged"
          RenderItem={StagedFileStatusItem}
          itemSize={48}
        />
      </AccordionSection>
    </Accordion>
  )
}

interface FileListProps<T extends FileInfo> {
  files: Page<T>
  RenderItem: ComponentType<{ item: FilesByStatus[T][number] }>
  itemSize: number
}

const FileList = <T extends FileInfo>(props: FileListProps<T>) => {
  const { files, RenderItem, itemSize } = props

  return files[status].length ? (
    <Ariakit.CompositeRow>
      <VirtualizedDiv<FilesByStatus[T][number]>
        size="sm"
        items={files[status]}
        RenderItem={RenderItem}
        itemSize={itemSize}
        className={cn('w-full h-full')}
        options={options}
      />
    </Ariakit.CompositeRow>
  ) : (
    <p className={cn('text-sm text-light-950/50 italic p-3')}>
      No {status} files
    </p>
  )
}

export { FileStatuses, type FileStatusesProps }
