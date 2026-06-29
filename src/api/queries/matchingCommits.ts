import {
  keepPreviousData,
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import type { CommitId } from '../models'
import { MATCHING_COMMITS_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

export const MATCHING_COMMITS_LIMIT = 50

const matchingCommitsQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'matching_commits',
    }) as const,
  hashSearch: (repoPath: string, hashSearch: string) =>
    ({
      ...matchingCommitsQueryKeys.all(repoPath),
      hashSearch,
    }) as const,
}

const fetchMatchingCommits = (
  repoPath: string,
  hashSearch: string,
  context: QueryFunctionContext,
): Promise<CommitId[]> => {
  return fetchAndDeserialize(
    'get_matching_commits',
    {
      repoPath,
      hashSearch,
      limit: MATCHING_COMMITS_LIMIT,
    },
    MATCHING_COMMITS_SCHEMA,
    context,
  )
}

const matchingCommitsQuery = (repoPath: string, hashSearch: string) =>
  queryOptions({
    queryKey: [matchingCommitsQueryKeys.hashSearch(repoPath, hashSearch)],
    queryFn: hashSearch
      ? (context) => fetchMatchingCommits(repoPath, hashSearch, context)
      : skipToken,
    enabled: !!hashSearch,
    placeholderData: keepPreviousData,
  })

const useQueryMatchingCommits = (hashSearch: string) =>
  useRepositoryQuery(matchingCommitsQuery, hashSearch)

export { matchingCommitsQueryKeys, useQueryMatchingCommits }
