import { useEffect } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { usePrevious } from 'react-use'

import type { Page } from '@/api/models'

/**
 * Hook that clears the current page of an arbitrary query if it has no data.
 *
 * @param query - The query to check for data.
 * @param page - The page that the query was fetched for.
 * @param clearPage - A callback to clear the page if the query has no data.
 */
export const useHandlePageSync = (
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
 * Hook that tracks whether pagination controls are needed for a given query and its page.
 *
 * Maintains the previous state while a new page is loading to avoid flickering.
 *
 * @param query - The query to check for pagination.
 * @param page - The current page of the query.
 */
export const useNeedsPagination = (
  query: UseQueryResult<Page<unknown>>,
  page: number,
): boolean => {
  const paginate = page !== 0 || !!query.data?.hasNext
  const prevPaginate = usePrevious(paginate)

  return paginate || (!!prevPaginate && query.isLoading)
}
