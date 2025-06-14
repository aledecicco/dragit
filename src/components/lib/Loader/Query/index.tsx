import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

import { RetryError } from '@/lib/RetryError'
import { Skeleton } from '@/ui/Skeleton'
import { getErrorMessage } from '@/utils/error'

interface QueryLoaderProps<T> {
  /**
   * The query result to wait for.
   */
  query: UseQueryResult<T>

  /**
   * Fallback to show while the query is loading.
   * Defaults to a skeleton.
   */
  loadingFallback?: ReactNode

  /**
   * Fallback to show in case of failure.
   * Defaults to a "retry" button.
   *
   * @param error - The error that caused the query to fail.
   */
  errorFallback?: (error: Error) => ReactNode

  /**
   * Function that accepts the query's result and returns the children to render.
   *
   * @param result - The resulting data of the query.
   */
  children: (result: T) => ReactNode
}

/**
 * Component that waits for a query to finish loading and provides the result to its children.
 *
 * Shows a loading fallback in the meantime, and an error falback in case of failure.
 */
const QueryLoader = <T,>(props: QueryLoaderProps<T>) => {
  const { query, loadingFallback, errorFallback, children } = props

  if (query.isError) {
    if (query.isFetching) {
      return loadingFallback ?? <Skeleton variant="fill" />
    }

    return errorFallback ? (
      errorFallback(query.error)
    ) : (
      <RetryError
        message={getErrorMessage(query.error)}
        retry={() => {
          query.refetch()
        }}
      />
    )
  }

  if (query.isLoading || query.isPending) {
    return loadingFallback ?? <Skeleton variant="fill" />
  }

  return children(query.data)
}

export { QueryLoader, type QueryLoaderProps }
