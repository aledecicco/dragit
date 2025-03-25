import {
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
} from '@tabler/icons-react'
import { type ComponentProps, useMemo } from 'react'

import { useAddToIndex, useRemoveFromIndex } from '@api/mutations'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn, propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { useFilesByStatus } from '@widgets/FileStatuses/utils'
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

  const untrackedOptions = useMemo(() => {
    return mapFn(files, (files) => ({
      getItemKey: (index: number) => files.untracked[index].path,
    }))
  }, [files])
  const unmergedOptions = useMemo(() => {
    return mapFn(files, (files) => ({
      getItemKey: (index: number) => files.unmerged[index].path,
    }))
  }, [files])
  const unstagedOptions = useMemo(() => {
    return mapFn(files, (files) => ({
      getItemKey: (index: number) => files.unstaged[index].path,
    }))
  }, [files])
  const stagedOptions = useMemo(() => {
    return mapFn(files, (files) => ({
      getItemKey: (index: number) => files.staged[index].path,
    }))
  }, [files])

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
        {files.untracked.length ? (
          <VirtualizedDiv
            size="sm"
            items={files.untracked}
            RenderItem={UntrackedFileStatusItem}
            itemSize={34}
            className={cn('w-full h-full')}
            options={untrackedOptions}
          />
        ) : (
          <p className={cn('text-sm text-light-950/50 italic p-3')}>
            No untracked files
          </p>
        )}
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
        {files.unmerged.length ? (
          <VirtualizedDiv
            size="sm"
            items={files.unmerged}
            RenderItem={UnmergedFileStatusItem}
            itemSize={48}
            className={cn('w-full h-full')}
            options={unmergedOptions}
          />
        ) : (
          <p className={cn('text-sm text-light-950/50 italic p-3')}>
            No unstaged files
          </p>
        )}
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
        {files.unstaged.length ? (
          <VirtualizedDiv
            size="sm"
            items={files.unstaged}
            RenderItem={UnstagedFileStatusItem}
            itemSize={48}
            className={cn('w-full h-full')}
            options={unstagedOptions}
          />
        ) : (
          <p className={cn('text-sm text-light-950/50 italic p-3')}>
            No unstaged files
          </p>
        )}
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
        {files.staged.length ? (
          <VirtualizedDiv
            size="sm"
            items={files.staged}
            RenderItem={StagedFileStatusItem}
            itemSize={48}
            className={cn('w-full h-full')}
            options={stagedOptions}
          />
        ) : (
          <p className={cn('text-sm text-light-950/50 italic p-3')}>
            No staged files
          </p>
        )}
      </AccordionSection>
    </Accordion>
  )
}

export { FileStatuses, type FileStatusesProps }
