import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { type ComponentProps, useMemo } from 'react'

import type { FileInfo } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'

interface FileStatusesProps extends ComponentProps<'div'> {
  path: string
}

const FileStatuses = (props: FileStatusesProps) => {
  const { path, ...divProps } = props
  const headInfo = useQuery(headInfoQuery(path))

  return (
    <div {...divProps}>
      {headInfo.data ? (
        <FileStatusesList files={headInfo.data.files} />
      ) : (
        <p className={clsx('text-sm italic text-light-500')}>
          {headInfo.isFetching
            ? 'Loading current branch...'
            : 'No file info found'}
        </p>
      )}
    </div>
  )
}

const FileStatusesList = (props: { files: FileInfo[] }) => {
  const { files } = props

  const staged = useMemo(() => {
    return files.filter(
      (file) =>
        (file.status === 'modified' || file.status === 'moved') &&
        file.staged !== 'unmodified',
    )
  }, [files])

  const unstaged = useMemo(() => {
    return files.filter(
      (file) =>
        (file.status === 'modified' || file.status === 'moved') &&
        file.unstaged !== 'unmodified',
    )
  }, [files])

  const unmerged = useMemo(() => {
    return files.filter((file) => file.status === 'unmerged')
  }, [files])

  const untracked = useMemo(() => {
    return files.filter((file) => file.status === 'untracked')
  }, [files])

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
