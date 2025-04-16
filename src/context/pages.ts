import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import type { FileType } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { getFileTypeFilter } from '@api/utils'

type FilePages = Map<string, number>
const filesPages = new Store<FilePages>(new Map())

const getMapKey = (types: FileType | FileType[]): string =>
  JSON.stringify(getFileTypeFilter(types))

const useFilesPages = () => useStore(filesPages)

const useFilesPage = (types: FileType | FileType[]) => {
  const pages = useFilesPages()

  const key = getMapKey(types)
  const page = pages.get(key)

  if (page === undefined) {
    clearPage(types)
    return 0
  }

  return page
}

const clearPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, 0)
    return newState
  })
}

const setNextPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, (newState.get(key) ?? 0) + 1)
    return newState
  })
}

const setPrevPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, Math.max(0, (newState.get(key) ?? 0) - 1))
    return newState
  })
}

const usePagesSync = (types: FileType | FileType[], pathspec?: string) => {
  const filesQuery = useQueryFiles(types, pathspec)
  const page = useFilesPage(types)

  useEffect(() => {
    if (page && !filesQuery.isLoading && !filesQuery.data?.items.length) {
      clearPage(types)
    }
  }, [types, page, filesQuery.data, filesQuery.isLoading])
}

export { useFilesPage, setNextPage, setPrevPage, usePagesSync, type FileType }
