import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import {
  useQueryStagedFiles,
  useQueryUnmergedFiles,
  useQueryUnstagedFiles,
  useQueryUntrackedFiles,
} from '@api/queries'

interface FilesPages {
  staged: number
  unstaged: number
  unmerged: number
  untracked: number
}

type FileType = keyof FilesPages

const filesPages = new Store({
  staged: 0,
  unstaged: 0,
  unmerged: 0,
  untracked: 0,
})

const useFilesPages = () => useStore(filesPages)

const useFilesPage = (type: FileType) => useFilesPages()[type]

const setNextPage = (type: FileType) => {
  filesPages.setState((state) => ({
    ...state,
    [type]: state[type] + 1,
  }))
}

const setPrevPage = (type: FileType) => {
  filesPages.setState((state) => ({
    ...state,
    [type]: Math.max(state[type] - 1, 0),
  }))
}

const usePagesSync = () => {
  const pages = useFilesPages()
  const stagedFiles = useQueryStagedFiles()
  const unstagedFiles = useQueryUnstagedFiles()
  const unmergedFiles = useQueryUnmergedFiles()
  const untrackedFiles = useQueryUntrackedFiles()

  useEffect(() => {
    if (
      pages.staged > 0 &&
      !stagedFiles.isLoading &&
      !stagedFiles.data?.items.length
    ) {
      setPrevPage('staged')
    }
    if (
      pages.unstaged > 0 &&
      !unstagedFiles.isLoading &&
      !unstagedFiles.data?.items.length
    ) {
      setPrevPage('unstaged')
    }
    if (
      pages.unmerged > 0 &&
      !unmergedFiles.isLoading &&
      !unmergedFiles.data?.items.length
    ) {
      setPrevPage('unmerged')
    }
    if (
      pages.untracked > 0 &&
      !untrackedFiles.isLoading &&
      !untrackedFiles.data?.items.length
    ) {
      setPrevPage('untracked')
    }
  }, [
    stagedFiles.data,
    stagedFiles.isLoading,
    unstagedFiles.data,
    unstagedFiles.isLoading,
    unmergedFiles.data,
    unmergedFiles.isLoading,
    untrackedFiles.data,
    untrackedFiles.isLoading,
    pages,
  ])
}

export { useFilesPage, setNextPage, setPrevPage, usePagesSync, type FileType }
