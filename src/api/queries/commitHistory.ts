import {
  infiniteQueryOptions,
  type QueryFunctionContext,
  skipToken,
} from '@tanstack/react-query'

import type { HistoryItem, Page } from '../models'
import { HISTORY_PAGE_SCHEMA } from '../schemas'
import {
  fetchAndDeserialize,
  pathQueryKey,
  useRepositoryInfiniteQuery,
} from '../utils'

export const HISTORY_PAGE_SIZE = 50

const commitHistoryQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'commit_history',
    }) as const,
  reference: (repoPath: string, reference: string | undefined) =>
    ({
      ...commitHistoryQueryKeys.all(repoPath),
      reference: reference,
    }) as const,
}

const fetchCommitHistoryPage = (
  repoPath: string,
  refName: string,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<HistoryItem>> => {
  return fetchAndDeserialize(
    'get_commit_history_page',
    {
      repoPath,
      reference: refName,
      startAfter: page * HISTORY_PAGE_SIZE,
      limit: HISTORY_PAGE_SIZE,
    },
    HISTORY_PAGE_SCHEMA,
    context,
  )
}

const commitHistoryQuery = (repoPath: string, refName: string | undefined) =>
  infiniteQueryOptions({
    queryKey: [commitHistoryQueryKeys.reference(repoPath, refName)],
    queryFn: refName
      ? (context) =>
          fetchCommitHistoryPage(repoPath, refName, context.pageParam, context)
      : skipToken,
    enabled: !!refName,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNext ? lastPageParam + 1 : undefined
    },
  })

const useQueryCommitHistory = (refName: string | undefined) =>
  useRepositoryInfiniteQuery(commitHistoryQuery, refName)

export { commitHistoryQueryKeys, useQueryCommitHistory }
