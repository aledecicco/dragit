import clsx from 'clsx'
import type { ComponentProps } from 'react'

import type { HeadInfo } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { Accordion } from '@lib/Accordion'
import { mapOr } from '@utils/array'
import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'
import { getFilesByStatus } from './utils'

interface FileStatusesProps extends ComponentProps<'div'> {}

const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props
  const headInfo = useRepositoryQuery(headInfoQuery)

  return (
    <div {...divProps}>
      {headInfo.data ? (
        <FileStatusesList headInfo={headInfo.data} />
      ) : (
        <p className={clsx('text-sm italic text-light-600')}>
          Loading files...
        </p>
      )}
    </div>
  )
}

const FileStatusesList = (props: { headInfo: HeadInfo }) => {
  const { headInfo } = props
  const { staged, unstaged, unmerged, untracked } = getFilesByStatus(headInfo)

  return (
    <Accordion
      showArrows
      sections={[
        {
          id: 'staged',
          label: 'Staged Files',
          extraInfo: (
            <div className={clsx('text-xs text-light-700 font-semibold')}>
              {staged.length}
            </div>
          ),
          defaultOpen: true,
          description: mapOr(
            <p className={clsx('text-sm italic text-light-800')}>
              No staged files
            </p>,
            staged,
            (file) => <StagedFileStatusItem key={file.path} file={file} />,
          ),
        },
        {
          id: 'unstaged',
          label: 'Unstaged Files',
          extraInfo: (
            <div className={clsx('text-xs text-light-700 font-semibold')}>
              {unstaged.length}
            </div>
          ),
          defaultOpen: true,
          description: mapOr(
            <p className={clsx('text-sm italic text-light-800')}>
              No unstaged files
            </p>,
            unstaged,
            (file) => <UnstagedFileStatusItem key={file.path} file={file} />,
          ),
        },
        {
          id: 'unmerged',
          label: 'Unmerged Files',
          extraInfo: (
            <div className={clsx('text-xs text-light-700 font-semibold')}>
              {unmerged.length}
            </div>
          ),
          defaultOpen: true,
          description: mapOr(
            <p className={clsx('text-sm italic text-light-800')}>
              No unmerged files
            </p>,
            unmerged,
            (file) => <UnmergedFileStatusItem key={file.path} file={file} />,
          ),
        },
        {
          id: 'untracked',
          label: 'Untracked Files',
          extraInfo: (
            <div className={clsx('text-xs text-light-700 font-semibold')}>
              {untracked.length}
            </div>
          ),
          defaultOpen: true,
          description: mapOr(
            <p className={clsx('text-sm italic text-light-800')}>
              No untracked files
            </p>,
            untracked,
            (file) => <UntrackedFileStatusItem key={file.path} file={file} />,
          ),
        },
      ]}
    />
  )
}

export { FileStatuses, type FileStatusesProps }
