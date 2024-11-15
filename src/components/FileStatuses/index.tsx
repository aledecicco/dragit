import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { FileInfo } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { StagedFileStatusItem } from './StagedFile'
import { UnmergedFileStatusItem } from './UnmergedFile'
import { UnstagedFileStatusItem } from './UnstagedFile'
import { UntrackedFileStatusItem } from './UntrackedFile'

interface FileStatusesProps {
  path: string
}

const FileStatuses = (props: FileStatusesProps) => {
  const { path } = props
  const headInfo = useQuery(headInfoQuery(path))

  return (
    <div>
      {headInfo.data ? (
        <FileStatusesList files={headInfo.data.files} />
      ) : (
        <p>
          {headInfo.isFetching
            ? 'Loading current branch...'
            : 'No branch checked out'}
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
    <div>
      <div>
        <h4>Staged files</h4>
        {staged.map((file) => (
          <StagedFileStatusItem key={file.path} file={file} />
        ))}
      </div>

      <div>
        <h4>Unstaged files</h4>
        {unstaged.map((file) => (
          <UnstagedFileStatusItem key={file.path} file={file} />
        ))}
      </div>

      <div>
        <h4>Unmerged files</h4>
        {unmerged.map((file) => (
          <UnmergedFileStatusItem key={file.path} file={file} />
        ))}
      </div>

      <div>
        <h4>Untracked files</h4>
        {untracked.map((file) => (
          <UntrackedFileStatusItem key={file.path} file={file} />
        ))}
      </div>
    </div>
  )
}

export { FileStatuses, type FileStatusesProps }
