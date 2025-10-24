import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { MS_IN_SECOND } from '@/utils/time'

import type { StashInfo } from '../models'
import { STASHES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const stashesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'stashes',
    }) as const,
}

const fetchStashes = async (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<StashInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_stashes',
    { repoPath },
    STASHES_SCHEMA,
    context,
  )

  return res.map((resItem) => ({
    ...resItem,
    type: 'stash',
    timestamp: resItem.timestamp * MS_IN_SECOND,
  }))
}

const stashesQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [stashesQueryKeys.all(repoPath)],
    queryFn: (context) => fetchStashes(repoPath, context),
  })

const useQueryStashes = () => useRepositoryQuery(stashesQuery)

export { stashesQueryKeys, useQueryStashes }
