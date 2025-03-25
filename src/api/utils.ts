import {
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query'

import { PAGE_SIZE, useQueryCurrentDir } from './queries'

export function mutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationOptions<TData, TError, TVariables, TContext> {
  return options
}

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

const useHasCurrentPath = () => {
  const path = useQueryCurrentDir().data?.path

  return !!path
}

// A hook that returns the path in the currentDir query assuming it's there
const useCurrentPath = () => {
  const path = useQueryCurrentDir().data?.path

  if (!path) {
    throw new Error('Repository path is not available')
  }

  return path
}

const useRepositoryMutation = <
  A extends unknown[],
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  repositoryMutation: (
    path: string,
    ...args: A
  ) => UseMutationOptions<TData, TError, TVariables, TContext>,
  ...args: A
) => {
  const path = useCurrentPath()

  return useMutation(repositoryMutation(path, ...args))
}

const useRepositoryQuery = <
  A extends unknown[],
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(
  repositoryQuery: (
    path: string,
    ...args: A
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ...args: A
) => {
  const path = useCurrentPath()

  return useQuery(repositoryQuery(path, ...args))
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
  const path = useCurrentPath()

  if (!path) {
    throw new Error('Repository path is not available')
  }

  return useInfiniteQuery(repositoryQuery(path, ...args))
}

export {
  getPaginatedItem,
  getNextPaginatedItem,
  getPaginatedLength,
  useRepositoryQuery,
  useRepositoryInfiniteQuery,
  useHasCurrentPath,
  useCurrentPath,
  useRepositoryMutation,
}
