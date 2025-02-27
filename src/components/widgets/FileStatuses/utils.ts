import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type {
  FileInfo,
  StagedFile,
  UnmergedFile,
  UnstagedFile,
  UntrackedFile,
} from '@api/models'
import { headInfoQuery } from '@api/queries'
import { useCurrentDirectory } from '@context/directory'

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

const useStagedFiles = (files: FileInfo[]) =>
  useMemo(() => getStagedFiles(files), [files])

const useUnstagedFiles = (files: FileInfo[]) =>
  useMemo(() => getUnstagedFiles(files), [files])

const useUnmergedFiles = (files: FileInfo[]) =>
  useMemo(() => getUnmergedFiles(files), [files])

const useUntrackedFiles = (files: FileInfo[]) =>
  useMemo(() => getUntrackedFiles(files), [files])

interface FilesByStatus {
  staged: StagedFile[]
  unstaged: UnstagedFile[]
  unmerged: UnmergedFile[]
  untracked: UntrackedFile[]
}

const useCurrentFilesByStatus = () => {
  const path = useCurrentDirectory()
  const filesByStatus = useQuery({
    ...headInfoQuery(path),
    select: (headInfo) => ({
      staged: getStagedFiles(headInfo.files),
      unstaged: getUnstagedFiles(headInfo.files),
      unmerged: getUnmergedFiles(headInfo.files),
      untracked: getUntrackedFiles(headInfo.files),
    }),
  })

  return filesByStatus
}

export {
  useStagedFiles,
  useUnstagedFiles,
  useUnmergedFiles,
  useUntrackedFiles,
  useCurrentFilesByStatus,
  type FilesByStatus,
}
