import type { UseQueryResult } from '@tanstack/react-query'
import { Store, useStore } from '@tanstack/react-store'
import { useCallback, useEffect, useMemo } from 'react'
import { usePrevious } from 'react-use'

import type { FileType, Page } from '@api/models'
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

  return page ?? 0
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

const useHandlePageSync = (
  query: UseQueryResult<Page<unknown>>,
  page: number,
  clearPage: () => void,
) => {
  useEffect(() => {
    if (page && !query.isLoading && !query.data?.items.length) {
      clearPage()
    }
  }, [clearPage, query.data, query.isLoading, page])
}

const useHandleFilesPageSync = (
  types: FileType | FileType[],
  pathspec?: string,
) => {
  const filesQuery = useQueryFiles(types, pathspec)
  const page = useFilesPage(types)
  const clear = useCallback(() => {
    clearPage(types)
  }, [types])

  useHandlePageSync(filesQuery, page, clear)
}

const needsPagination = (page: number, hasNext: boolean) => {
  return page !== 0 || hasNext
}

const useNeedsPagination = (
  query: UseQueryResult<Page<unknown>>,
  page: number,
) => {
  const paginate = useMemo(
    () => needsPagination(page, !!query.data?.hasNext),
    [query.data?.hasNext, page],
  )
  const prevPaginate = usePrevious(paginate)

  return paginate || (prevPaginate && query.isLoading)
}

export {
  useFilesPage,
  setNextPage,
  setPrevPage,
  clearPage,
  useHandlePageSync,
  useHandleFilesPageSync,
  useNeedsPagination,
  type FileType,
}
