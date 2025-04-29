import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { RetryError } from '@lib/RetryError'
import { Skeleton } from '@ui/Skeleton'
import { getErrorMessage } from '@utils/error'

interface QueryLoaderProps<T> {
  query: UseQueryResult<T>
  loadingFallback?: ReactNode
  errorFallback?: (error: Error) => ReactNode
  children: (result: T) => ReactNode
}

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

  if (query.data === undefined) {
    return loadingFallback ?? <Skeleton variant="fill" />
  }

  return children(query.data)
}

export { QueryLoader, type QueryLoaderProps }
