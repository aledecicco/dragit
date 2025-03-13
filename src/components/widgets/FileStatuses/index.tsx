import type { ComponentProps } from 'react'

import { useAddToIndex, useRemoveFromIndex } from '@api/commands'
import { headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import {
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
} from '@tabler/icons-react'
import { Accordion } from '@ui/Accordion'
import { IconButton } from '@ui/IconButton'
import { mapOr } from '@utils/array'
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
          description: mapOr(
            <p className={cn('text-sm text-light-950')}>No untracked files</p>,
            files.untracked,
            (file) => <UntrackedFileStatusItem key={file.path} file={file} />,
          ),
          className: 'flex flex-col gap-2 p-2 min-h-30',
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
          description: mapOr(
            <p className={cn('text-sm text-light-950')}>No unmerged files</p>,
            files.unmerged,
            (file) => <UnmergedFileStatusItem key={file.path} file={file} />,
          ),
          className: 'flex flex-col gap-2 p-2 min-h-30',
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
          description: mapOr(
            <p className={cn('text-sm text-light-950')}>No unstaged files</p>,
            files.unstaged,
            (file) => <UnstagedFileStatusItem key={file.path} file={file} />,
          ),
          className: 'flex flex-col gap-2 p-2 min-h-30',
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
          description: mapOr(
            <p className={cn('text-sm text-light-950')}>No staged files</p>,
            files.staged,
            (file) => <StagedFileStatusItem key={file.path} file={file} />,
          ),
          className: 'flex flex-col gap-2 p-2 min-h-30',
        },
      ]}
    />
  )
}

export { FileStatuses, type FileStatusesProps }
