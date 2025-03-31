import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import type { FileType } from '@api/models'
import { useQueryFiles } from '@api/queries'

const filesPages = new Store({
  staged: 0,
  unstaged: 0,
  unmerged: 0,
  untracked: 0,
})

const useFilesPages = () => useStore(filesPages)

const useFilesPage = (type: FileType) => useFilesPages()[type]

const clearPage = (type: FileType) => {
  filesPages.setState((state) => ({
    ...state,
    [type]: 0,
  }))
}

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
  const stagedFiles = useQueryFiles('staged')
  const unstagedFiles = useQueryFiles('unstaged')
  const unmergedFiles = useQueryFiles('unmerged')
  const untrackedFiles = useQueryFiles('untracked')

  useEffect(() => {
    if (
      pages.staged > 0 &&
      !stagedFiles.isLoading &&
      !stagedFiles.data?.items.length
    ) {
      clearPage('staged')
    }

    if (
      pages.unstaged > 0 &&
      !unstagedFiles.isLoading &&
      !unstagedFiles.data?.items.length
    ) {
      clearPage('unstaged')
    }

    if (
      pages.unmerged > 0 &&
      !unmergedFiles.isLoading &&
      !unmergedFiles.data?.items.length
    ) {
      clearPage('unmerged')
    }

    if (
      pages.untracked > 0 &&
      !untrackedFiles.isLoading &&
      !untrackedFiles.data?.items.length
    ) {
      clearPage('untracked')
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
