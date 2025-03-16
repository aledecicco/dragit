import { useMemo } from 'react'

import type {
  FileInfo,
  HeadInfo,
  StagedFile,
  UnmergedFile,
  UnstagedFile,
  UntrackedFile,
} from '@api/models'
import { headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { mapFn } from '@utils/types'

const getStagedFiles = (files: FileInfo[]): StagedFile[] =>
  files.filter(
    (file) =>
      (file.status === 'modified' || file.status === 'moved') &&
      file.staged !== 'unmodified',
  )

const getUnstagedFiles = (files: FileInfo[]): UnstagedFile[] =>
  files.filter(
    (file) =>
      (file.status === 'modified' || file.status === 'moved') &&
      file.unstaged !== 'unmodified',
  )

const getUnmergedFiles = (files: FileInfo[]): UnmergedFile[] =>
  files.filter((file) => file.status === 'unmerged')

const getUntrackedFiles = (files: FileInfo[]): UntrackedFile[] =>
  files.filter((file) => file.status === 'untracked')

const useStagedFiles = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  return useMemo(() => mapFn(headInfo.data?.files, getStagedFiles), [headInfo])
}

const useUnstagedFiles = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  return useMemo(
    () => mapFn(headInfo.data?.files, getUnstagedFiles),
    [headInfo],
  )
}

const useUnmergedFiles = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  return useMemo(
    () => mapFn(headInfo.data?.files, getUnmergedFiles),
    [headInfo],
  )
}

const useUntrackedFiles = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  return useMemo(
    () => mapFn(headInfo.data?.files, getUntrackedFiles),
    [headInfo],
  )
}

interface FilesByStatus {
  staged: StagedFile[]
  unstaged: UnstagedFile[]
  unmerged: UnmergedFile[]
  untracked: UntrackedFile[]
}

const getFilesByStatus = (headInfo: HeadInfo): FilesByStatus => ({
  staged: getStagedFiles(headInfo.files),
  unstaged: getUnstagedFiles(headInfo.files),
  unmerged: getUnmergedFiles(headInfo.files),
  untracked: getUntrackedFiles(headInfo.files),
})

const useFilesByStatus = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  return useMemo(() => mapFn(headInfo.data, getFilesByStatus), [headInfo])
}

export {
  useStagedFiles,
  useUnstagedFiles,
  useUnmergedFiles,
  useUntrackedFiles,
  useFilesByStatus,
  type FilesByStatus,
}
