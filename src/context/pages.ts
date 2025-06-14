import { useEffect } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { Store, useStore } from '@tanstack/react-store'
import { usePrevious } from 'react-use'

import type { FileType, Page } from '@/api/models'
import { useQueryFiles } from '@/api/queries'
import { getFileTypeFilter } from '@/api/utils'

type FilePages = Map<string, number>
const filesPages = new Store<FilePages>(new Map())

const getMapKey = (types: FileType | FileType[]): string =>
  JSON.stringify(getFileTypeFilter(types))

const useFilesPages = () => useStore(filesPages)

/**
 * Returns the page that the application is currently on for the given file types.
 * Defaults to 0.
 *
 * @param types - The set of file types being paginated.
 */
const useFilesPage = (types: FileType | FileType[]) => {
  const pages = useFilesPages()

  const key = getMapKey(types)
  const page = pages.get(key)

  return page ?? 0
}

/**
 * Clears the current page for the given file types, resetting it to 0.
 *
 * @param types - The set of file types to clear the page for.
 */
const clearPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, 0)
    return newState
  })
}

/**
 * Changes the current page for the given file types to the next one.
 *
 * @param types - The set of file types to change the page for.
 */
const setNextPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, (newState.get(key) ?? 0) + 1)
    return newState
  })
}

/**
 * Changes the current page for the given file types to the previous one.
 *
 * @param types - The set of file types to change the page for.
 */
const setPrevPage = (types: FileType | FileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, Math.max(0, (newState.get(key) ?? 0) - 1))
    return newState
  })
}

/**
 * Hook that clears the current page of an arbitrary query if it has no data.
 *
 * @param query - The query to check for data.
 * @param page - The page that the query was fetched for.
 * @param clearPage - A callback to clear the page if the query has no data.
 */
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

/**
 * Hook that clears the current page for a given set of file types if their corresponding query has no data.
 *
 * @param types - The set of file types to check.
 * @param pathspec - An optional pathspec to filter the files.
 */
const useHandleFilesPageSync = (
  types: FileType | FileType[],
  pathspec?: string,
) => {
  const filesQuery = useQueryFiles(types, pathspec)
  const page = useFilesPage(types)
  const clear = () => {
    clearPage(types)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: clear page when search changes
  useEffect(() => {
    clearPage(types)
  }, [types, pathspec, clearPage])
  useHandlePageSync(filesQuery, page, clear)
}

/**
 * Whether pagination controls are needed for a given state.
 *
 * @param page - The page a query is in.
 * @param hasNext - Whether there are more pages available.
 */
const needsPagination = (page: number, hasNext: boolean): boolean => {
  return page !== 0 || hasNext
}

/**
 * Hook that tracks whether pagination controls are needed for a given query and its page.
 *
 * Maintains the previous state while a new page is loading to avoid flickering.
 *
 * @param query - The query to check for pagination.
 * @param page - The current page of the query.
 */
const useNeedsPagination = (
  query: UseQueryResult<Page<unknown>>,
  page: number,
): boolean => {
  const paginate = needsPagination(page, !!query.data?.hasNext)
  const prevPaginate = usePrevious(paginate)

  return paginate || (!!prevPaginate && query.isLoading)
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
