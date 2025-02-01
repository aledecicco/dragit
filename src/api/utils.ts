import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'

import { PAGE_SIZE } from './queries'

const getPaginatedItem = <T>(
  query: UseInfiniteQueryResult<InfiniteData<T[]>>,
  index: number,
): T | undefined => {
  const pageIndex = Math.floor(index / PAGE_SIZE)
  const itemIndex = index % PAGE_SIZE

  return query.data?.pages.at(pageIndex)?.at(itemIndex)
}

const getNextPaginatedItem = <T>(
  query: UseInfiniteQueryResult<InfiniteData<T[]>>,
  index: number,
): T | undefined => {
  return getPaginatedItem(query, index + 1)
}

const getPaginatedLength = <T>(
  query: UseInfiniteQueryResult<InfiniteData<T[]>>,
): number => {
  return query.data?.pages.reduce((sum, page) => sum + page.length, 0) ?? 0
}

export { getPaginatedItem, getNextPaginatedItem, getPaginatedLength }
