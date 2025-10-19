import { useEffect } from 'react'
import {
  type DefaultError,
  type InfiniteData,
  type QueryFunctionContext,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { Channel, invoke } from '@tauri-apps/api/core'
import { Child } from '@tauri-apps/plugin-shell'
import { type BorshSchema, borshDeserialize } from 'borsher'
import { usePrevious } from 'react-use'
import { match } from 'ts-pattern'

import type {
  AppMessage,
  FileTypeFilter,
  Page,
  WorktreeFileType,
} from './models'
import { useQueryCurrentDir } from './queries'

/**
 * An implementation of `queryOptions` for mutations.
 */
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

/**
 * Retrieves an item at a specific index in a paginated data structure.
 *
 * @param data - The paginated data structure.
 * @param index - The index of the item to retrieve.
 */
const getPaginatedItem = <T>(
  data: InfiniteData<{ items: T[] }> | undefined,
  index: number,
  pageSize: number,
): T | undefined => {
  const pageIndex = Math.floor(index / pageSize)
  const itemIndex = index % pageSize

  return data?.pages?.at(pageIndex)?.items.at(itemIndex)
}

/**
 * Calculates the total number of items across all pages in a paginated data structure.
 *
 * @param data - The paginated data structure.
 */
const getPaginatedLength = <T>(
  data: InfiniteData<{ items: T[] }> | undefined,
): number => {
  return data?.pages?.reduce((sum, page) => sum + page.items.length, 0) ?? 0
}

/**
 * @returns The current repository path, assuming it's available.
 * @throws If the repository path is not available.
 */
const useCurrentPath = () => {
  const repoPath = useQueryCurrentDir().data?.path

  if (!repoPath) {
    throw new Error('Repository path is not available')
  }

  return repoPath
}

/**
 * A wrapper around {@link useMutation} that provides the current repository path.
 *
 * @param repositoryMutation - The inner mutation, which should accept a path as the first argument.
 * @param args - The rest of the arguments to pass to the mutation.
 */
const useRepositoryMutation = <
  A extends unknown[],
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  repositoryMutation: (
    repoPath: string,
    ...args: A
  ) => UseMutationOptions<TData, TError, TVariables, TContext>,
  ...args: A
) => {
  const repoPath = useCurrentPath()
  return useMutation(repositoryMutation(repoPath, ...args))
}

/**
 * A wrapper around {@link useQuery} that provides the current repository path.
 *
 * @param repositoryQuery - The inner query, which should accept a path as the first argument.
 * @param args - The rest of the arguments to pass to the query.
 */
const useRepositoryQuery = <
  A extends unknown[],
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(
  repositoryQuery: (
    repoPath: string,
    ...args: A
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ...args: A
) => {
  const repoPath = useCurrentPath()
  return useQuery(repositoryQuery(repoPath, ...args))
}

/**
 * A wrapper around {@link useInfiniteQuery} that provides the current repository path.
 *
 * @param repositoryQuery - The inner infinite query, which should accept a path as the first argument.
 * @param args - The rest of the arguments to pass to the infinite query.
 */
const useRepositoryInfiniteQuery = <
  A extends unknown[],
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  repositoryQuery: (
    repoPath: string,
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
  const repoPath = useCurrentPath()
  return useInfiniteQuery(repositoryQuery(repoPath, ...args))
}

/**
 * Runs a command in the backend and deserializes the result using the provided schema.
 * Opens a channel to the backend, through which the backend can send the pid of the process running the command.
 * If the query is aborted through the `context.signal`, the process is killed.
 * Works asynchronously, handling cases where the pid is received after the query is aborted, or viceversa.
 *
 * @param command - The command to run in the backend.
 * @param args - The arguments to pass to the command.
 * @param schema - The Borsh schema to use for deserializing the result.
 * @param context - The query function context, which contains the signal to listen for aborts.
 *
 * @returns A promise that resolves to the deserialized result.
 * @throws If the query is aborted.
 */
const fetchAndDeserialize = async <T>(
  command: string,
  args: Record<string, unknown>,
  schema: BorshSchema<T>,
  context: QueryFunctionContext,
): Promise<T> => {
  let shouldStop = false
  const processIds: number[] = []

  const abortSignal = context.signal
  abortSignal.onabort = () => {
    // When the query is aborted, we set a flag to kill processes later.
    shouldStop = true
    // And we kill any processes we already have the pid for.
    processIds.forEach((pid) => new Child(pid).kill())
  }

  const channel = new Channel<AppMessage>()
  channel.onmessage = (event) => {
    match(event)
      .with(
        {
          type: 'processStarted',
        },
        ({ pid }) => {
          if (shouldStop) {
            // If the query was aborted before we received the pid, we kill the process now.
            new Child(pid).kill()
          } else {
            // Otherwise we store it.
            processIds.push(pid)
          }
        },
      )
      .exhaustive()
  }

  if (shouldStop) {
    // Stop the query if it was aborted before it started.
    throw new Error('Aborted')
  }

  const buffer: ArrayBuffer = await invoke(command, {
    ...args,
    channel,
  })

  const res = borshDeserialize(schema, new Uint8Array(buffer))
  return res
}

/**
 * Builds a file type filter object based on the provided file types.
 *
 * @param types - The file types to filter by. Can be a single type or an array of types.
 */
const getFileTypeFilter = (
  types: WorktreeFileType | WorktreeFileType[],
): FileTypeFilter => {
  const filter: FileTypeFilter = {}

  if (typeof types === 'string') {
    filter[types] = true
  } else {
    for (const fileType of types) {
      filter[fileType] = true
    }
  }

  return filter
}

/**
 * Retrieves just the items from a paginated data structure.
 * @param page - The paginated data structure.
 */
const getPageItems = <T>(page: Page<T>): T[] => {
  return page.items
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
  const paginate = page !== 0 || !!query.data?.hasNext
  const prevPaginate = usePrevious(paginate)

  return paginate || (!!prevPaginate && query.isLoading)
}

export {
  getPaginatedItem,
  getPaginatedLength,
  useRepositoryQuery,
  useRepositoryInfiniteQuery,
  useCurrentPath,
  useRepositoryMutation,
  fetchAndDeserialize,
  getFileTypeFilter,
  getPageItems,
  useHandlePageSync,
  useNeedsPagination,
}
