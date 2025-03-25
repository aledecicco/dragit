import { useMemo } from 'react'

import type {
  FileInfo,
  HeadInfo,
  StagedFile,
  UnmergedFile,
  UnstagedFile,
  UntrackedFile,
} from '@api/models'
import { useQueryHeadInfo } from '@api/queries'
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
  const headInfoQuery = useQueryHeadInfo()
  return useMemo(
    () => mapFn(headInfoQuery.data?.files, getStagedFiles),
    [headInfoQuery.data?.files],
  )
}

const useUnstagedFiles = () => {
  const headInfoQuery = useQueryHeadInfo()
  return useMemo(
    () => mapFn(headInfoQuery.data?.files, getUnstagedFiles),
    [headInfoQuery.data?.files],
  )
}

const useUnmergedFiles = () => {
  const headInfoQuery = useQueryHeadInfo()
  return useMemo(
    () => mapFn(headInfoQuery.data?.files, getUnmergedFiles),
    [headInfoQuery.data?.files],
  )
}

const useUntrackedFiles = () => {
  const headInfoQuery = useQueryHeadInfo()
  return useMemo(
    () => mapFn(headInfoQuery.data?.files, getUntrackedFiles),
    [headInfoQuery.data?.files],
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
  const headInfoQuery = useQueryHeadInfo()
  return useMemo(
    () => mapFn(headInfoQuery.data, getFilesByStatus),
    [headInfoQuery.data],
  )
}

export {
  useStagedFiles,
  useUnstagedFiles,
  useUnmergedFiles,
  useUntrackedFiles,
  useFilesByStatus,
  type FilesByStatus,
}
