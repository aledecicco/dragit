import clsx from 'clsx'
import type { ComponentProps } from 'react'

import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'
import { type FilesByStatus, useCurrentFilesByStatus } from './utils'

interface FileStatusesProps extends ComponentProps<'div'> {}

const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props
  const files = useCurrentFilesByStatus()

  return (
    <div {...divProps}>
      {files.data ? (
        <FileStatusesList files={files.data} />
      ) : (
        <p className={clsx('text-sm italic text-light-500')}>
          {files.isFetching
            ? 'Loading current branch...'
            : 'No file info found'}
        </p>
      )}
    </div>
  )
}

const FileStatusesList = (props: { files: FilesByStatus }) => {
  const { files } = props
  const { staged, unstaged, unmerged, untracked } = files

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
            <p className={clsx('text-sm italic text-light-500')}>
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
            <p className={clsx('text-sm italic text-light-500')}>
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
            <p className={clsx('text-sm italic text-light-500')}>
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
            <p className={clsx('text-sm italic text-light-500')}>
              No untracked files
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { FileStatuses, type FileStatusesProps }
