import { useMemo } from 'react'

import type {
  FileInfo,
  HeadInfo,
  StagedFile,
  UnmergedFile,
  UnstagedFile,
  UntrackedFile,
} from '@api/models'

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

const getFilesByStatus = (headInfo: HeadInfo): FilesByStatus => ({
  staged: getStagedFiles(headInfo.files),
  unstaged: getUnstagedFiles(headInfo.files),
  unmerged: getUnmergedFiles(headInfo.files),
  untracked: getUntrackedFiles(headInfo.files),
})

export {
  useStagedFiles,
  useUnstagedFiles,
  useUnmergedFiles,
  useUntrackedFiles,
  getFilesByStatus,
  type FilesByStatus,
}
