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
  search: (repoPath: string, search: string) =>
    ({
      ...matchingCommitsQueryKeys.all(repoPath),
      search,
    }) as const,
}

const fetchMatchingCommits = (
  repoPath: string,
  search: string,
  context: QueryFunctionContext,
): Promise<CommitId[]> => {
  return fetchAndDeserialize(
    'get_matching_commits',
    {
      repoPath,
      search,
      limit: MATCHING_COMMITS_LIMIT,
    },
    MATCHING_COMMITS_SCHEMA,
    context,
  )
}

const matchingCommitsQuery = (repoPath: string, search: string) =>
  queryOptions({
    queryKey: [matchingCommitsQueryKeys.search(repoPath, search)],
    queryFn: search
      ? (context) => fetchMatchingCommits(repoPath, search, context)
      : skipToken,
    enabled: !!search,
    placeholderData: keepPreviousData,
  })

const useQueryMatchingCommits = (search: string) =>
  useRepositoryQuery(matchingCommitsQuery, search)

export { matchingCommitsQueryKeys, useQueryMatchingCommits }
