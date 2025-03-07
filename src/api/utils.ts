import {
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'

import { useCurrentDirectory } from '@context/directory'
import { PAGE_SIZE } from './queries'

const getPaginatedItem = <T>(
  data: InfiniteData<T[]> | undefined,
  index: number,
): T | undefined => {
  const pageIndex = Math.floor(index / PAGE_SIZE)
  const itemIndex = index % PAGE_SIZE

  return data?.pages?.at(pageIndex)?.at(itemIndex)
}

const getNextPaginatedItem = <T>(
  data: InfiniteData<T[]> | undefined,
  index: number,
): T | undefined => {
  return getPaginatedItem(data, index + 1)
}

const getPaginatedLength = <T>(data: InfiniteData<T[]> | undefined): number => {
  return data?.pages?.reduce((sum, page) => sum + page.length, 0) ?? 0
}

const useRepositoryQuery = <
  A extends unknown[],
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(
  repositoryQuery: (
    path: string,
    ...args: A
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ...args: A
) => {
  const directory = useCurrentDirectory()
  return useQuery(repositoryQuery(directory, ...args))
}

const useRepositoryInfiniteQuery = <
  A extends unknown[],
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  repositoryQuery: (
    path: string,
    ...args: A
  ) => UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey,
    TPageParam
  >,
  ...args: A
) => {
  const directory = useCurrentDirectory()
  return useInfiniteQuery(repositoryQuery(directory, ...args))
}

export {
  getPaginatedItem,
  getNextPaginatedItem,
  getPaginatedLength,
  useRepositoryQuery,
  useRepositoryInfiniteQuery,
}
