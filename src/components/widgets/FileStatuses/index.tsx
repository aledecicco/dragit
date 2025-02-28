import clsx from 'clsx'
import type { ComponentProps } from 'react'

import type { HeadInfo } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
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
          {headInfo.isFetching ? 'Loading files...' : 'No file info found'}
        </p>
      )}
    </div>
  )
}

const FileStatusesList = (props: { headInfo: HeadInfo }) => {
  const { headInfo } = props
  const { staged, unstaged, unmerged, untracked } = getFilesByStatus(headInfo)

  return (
    <div className={clsx('flex flex-col gap-4')}>
      <div>
        <p className={clsx('text-xs font-medium text-light-300 mb-1')}>
          Staged Changes
        </p>
        <div className={clsx('flex flex-col gap-1 p-1')}>
          {staged.length ? (
            staged.map((file) => (
              <StagedFileStatusItem key={file.path} file={file} />
            ))
          ) : (
            <p className={clsx('text-sm italic text-light-800')}>
              No staged files
            </p>
          )}
        </div>
      </div>

      <div>
        <p className={clsx('text-xs font-medium text-light-300 mb-1')}>
          Unstaged Changes
        </p>
        <div className={clsx('flex flex-col gap-1 p-1')}>
          {unstaged.length ? (
            unstaged.map((file) => (
              <UnstagedFileStatusItem key={file.path} file={file} />
            ))
          ) : (
            <p className={clsx('text-sm italic text-light-800')}>
              No unstaged files
            </p>
          )}
        </div>
      </div>

      <div>
        <p className={clsx('text-xs font-medium text-light-300 mb-1')}>
          Unmerged Changes
        </p>
        <div className={clsx('flex flex-col gap-1 p-1')}>
          {unmerged.length ? (
            unmerged.map((file) => (
              <UnmergedFileStatusItem key={file.path} file={file} />
            ))
          ) : (
            <p className={clsx('text-sm italic text-light-800')}>
              No unmerged files
            </p>
          )}
        </div>
      </div>

      <div>
        <p className={clsx('text-xs font-medium text-light-300 mb-1')}>
          Untracked Changes
        </p>
        <div className={clsx('flex flex-col gap-1 p-1')}>
          {untracked.length ? (
            untracked.map((file) => (
              <UntrackedFileStatusItem key={file.path} file={file} />
            ))
          ) : (
            <p className={clsx('text-sm italic text-light-800')}>
              No untracked files
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { FileStatuses, type FileStatusesProps }
