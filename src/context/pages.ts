import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import type { FileType, FileTypeFilter } from '@api/models'
import { useQueryFiles } from '@api/queries'

type FilePages = Map<FileTypeFilter, number>
export const filesPages = new Store<FilePages>(new Map())

const useFilesPages = () => useStore(filesPages)

const useFilesPage = (types: FileTypeFilter) => {
  const pages = useFilesPages()

  const page = pages.get(types)

  if (page === undefined) {
    pages.set(types, 0)
    return 0
  }

  return page
}

const clearPage = (types: FileTypeFilter) => {
  filesPages.setState((state) => {
    const newState = new Map(state)
    newState.set(types, 0)
    return newState
  })
}

const setNextPage = (types: FileTypeFilter) => {
  filesPages.setState((state) => {
    const newState = new Map(state)
    newState.set(types, (newState.get(types) ?? 0) + 1)
    return newState
  })
}

const setPrevPage = (types: FileTypeFilter) => {
  filesPages.setState((state) => {
    const newState = new Map(state)
    newState.set(types, Math.max(0, (newState.get(types) ?? 0) - 1))
    return newState
  })
}

// TODO: re-check if this is necessary
const usePagesSync = () => {
  const pages = useFilesPages()
  const stagedFiles = useQueryFiles({ staged: true })
  const unstagedFiles = useQueryFiles({ unstaged: true })
  const unmergedFiles = useQueryFiles({ unmerged: true })
  const untrackedFiles = useQueryFiles({ untracked: true })

  useEffect(() => {
    if (
      pages.get({ staged: true }) &&
      !stagedFiles.isLoading &&
      !stagedFiles.data?.items.length
    ) {
      clearPage({ staged: true })
    }

    if (
      pages.get({ unstaged: true }) &&
      !unstagedFiles.isLoading &&
      !unstagedFiles.data?.items.length
    ) {
      clearPage({ unstaged: true })
    }

    if (
      pages.get({ unmerged: true }) &&
      !unmergedFiles.isLoading &&
      !unmergedFiles.data?.items.length
    ) {
      clearPage({ unmerged: true })
    }

    if (
      pages.get({ untracked: true }) &&
      !untrackedFiles.isLoading &&
      !untrackedFiles.data?.items.length
    ) {
      clearPage({ untracked: true })
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
