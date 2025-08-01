import {
  infiniteQueryOptions,
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { DiffType, LineDiff, Page } from '../models'
import { FILE_DIFF_PAGE_SCHEMA } from '../schemas'
import {
  fetchAndDeserialize,
  useRepositoryInfiniteQuery,
  useRepositoryQuery,
} from '../utils'
import { pathQueryKey } from '.'

export const FILE_DIFF_PAGE_SIZE = 1000

const filesDiffQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'file_diff',
    }) as const,
  reference: (path: string, reference: string | undefined) =>
    ({
      ...filesDiffQueryKeys.all(path),
      reference: reference,
    }) as const,
  file: (
    path: string,
    reference: string | undefined,
    filepath: string | undefined,
  ) =>
    ({
      ...filesDiffQueryKeys.reference(path, reference),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  path: string,
  reference: string,
  filepath: string,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<LineDiff>> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      path,
      reference,
      filepath,
      startAfter: page * FILE_DIFF_PAGE_SIZE,
      limit: FILE_DIFF_PAGE_SIZE,
    },
    FILE_DIFF_PAGE_SCHEMA,
    context,
  )

  return res
}

const fileDiffQuery = (
  path: string,
  reference: string | undefined,
  filepath: string | undefined,
) =>
  infiniteQueryOptions({
    queryKey: [filesDiffQueryKeys.file(path, reference, filepath)],
    queryFn:
      !!reference && !!filepath
        ? (context) =>
            fetchFileDiff(path, reference, filepath, context.pageParam, context)
        : skipToken,

    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNext ? lastPageParam + 1 : undefined
    },
  })

const useQueryFileDiff = (
  reference: string | undefined,
  filediff: string | undefined,
) => useRepositoryInfiniteQuery(fileDiffQuery, reference, filediff)

export { filesDiffQueryKeys, useQueryFileDiff }
