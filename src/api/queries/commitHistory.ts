import {
  type QueryFunctionContext,
  infiniteQueryOptions,
  skipToken,
} from '@tanstack/react-query'

import { pathQueryKey } from '.'
import type { HistoryItem, Page } from '../models'
import { HISTORY_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryInfiniteQuery } from '../utils'

export const HISTORY_PAGE_SIZE = 50

const commitHistoryQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'commit_history',
    }) as const,
  reference: (path: string, reference: string | undefined) =>
    ({
      ...commitHistoryQueryKeys.all(path),
      reference: reference,
    }) as const,
}

const fetchCommitHistoryPage = (
  path: string,
  refName: string,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<HistoryItem>> => {
  return fetchAndDeserialize(
    'get_commit_history_page',
    {
      path,
      reference: refName,
      startAfter: page * HISTORY_PAGE_SIZE,
      limit: HISTORY_PAGE_SIZE,
    },
    HISTORY_PAGE_SCHEMA,
    context,
  )
}

const commitHistoryQuery = (path: string, refName: string | undefined) =>
  infiniteQueryOptions({
    queryKey: [commitHistoryQueryKeys.reference(path, refName)],
    queryFn: refName
      ? (context) =>
          fetchCommitHistoryPage(path, refName, context.pageParam, context)
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNext ? lastPageParam + 1 : undefined
    },
  })

const useQueryCommitHistory = (refName: string | undefined) =>
  useRepositoryInfiniteQuery(commitHistoryQuery, refName)

export { commitHistoryQueryKeys, useQueryCommitHistory }
