import {
  type DefaultError,
  type InfiniteData,
  type QueryFunctionContext,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { Channel, invoke } from '@tauri-apps/api/core'
import { Child } from '@tauri-apps/plugin-shell'
import { type BorshSchema, borshDeserialize } from 'borsher'
import { match } from 'ts-pattern'

import type { AppMessage, FileType, FileTypeFilter, Page } from './models'
import { useQueryCurrentDir } from './queries'

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
  data: InfiniteData<{ items: T[] }> | undefined,
  index: number,
  pageSize: number,
): T | undefined => {
  const pageIndex = Math.floor(index / pageSize)
  const itemIndex = index % pageSize

  return data?.pages?.at(pageIndex)?.items.at(itemIndex)
}

const getNextPaginatedItem = <T>(
  data: InfiniteData<{ items: T[] }> | undefined,
  index: number,
  pageSize: number,
): T | undefined => {
  return getPaginatedItem(data, index + 1, pageSize)
}

const getPaginatedLength = <T>(
  data: InfiniteData<{ items: T[] }> | undefined,
): number => {
  return data?.pages?.reduce((sum, page) => sum + page.items.length, 0) ?? 0
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
  return useInfiniteQuery(repositoryQuery(path, ...args))
}

const fetchAndDeserialize = async <T>(
  command: string,
  args: Record<string, unknown>,
  schema: BorshSchema<T>,
  context: QueryFunctionContext,
): Promise<T> => {
  let shouldStop = false
  let processId: number | undefined = undefined

  console.log(`Starting ${command} (${JSON.stringify(args)})`)

  const abortSignal = context.signal
  abortSignal.onabort = () => {
    if (processId !== undefined) {
      console.log(
        `Received abort signal and going to stop ${processId} (${command} with ${JSON.stringify(args)})'))})`,
      )
      new Child(processId).kill()
    } else {
      console.log(
        `Received abort signal but no pid yet (${command} with ${JSON.stringify(args)})`,
      )
      shouldStop = true
    }
  }

  const channel = new Channel<AppMessage>()
  channel.onmessage = (event) => {
    match(event)
      .with(
        {
          type: 'processStarted',
        },
        ({ pid }) => {
          processId = pid

          if (shouldStop) {
            console.log(
              `Received start message but already should stop ${pid} (${command} with ${JSON.stringify(args)})`,
            )
            new Child(pid).kill()
          } else {
            console.log(
              `Received start message with no stop yet ${pid} (${command} with ${JSON.stringify(args)})`,
            )
          }
        },
      )
      .exhaustive()
  }

  if (shouldStop) {
    console.log(
      `"Should stop" was set before invoking (${command} with ${JSON.stringify(args)})`,
    )
    throw new Error('Aborted')
  }

  const buffer: ArrayBuffer = await invoke(command, {
    ...args,
    channel,
  })

  const res = borshDeserialize(schema, new Uint8Array(buffer))
  console.log(
    `Finished ${command} (${JSON.stringify(args)}) (shouldStop ${shouldStop} - pid ${processId})`,
  )
  return res
}

const getFileTypeFilter = (types: FileType | FileType[]): FileTypeFilter => {
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

const getPageItems = <T>(page: Page<T>): T[] => {
  return page.items
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
  fetchAndDeserialize,
  getFileTypeFilter,
  getPageItems,
}
