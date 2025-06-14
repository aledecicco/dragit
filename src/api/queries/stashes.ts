import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { MS_IN_SECOND } from '@/utils/time'

import type { StashInfo } from '../models'
import { STASHES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const stashesQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'stashes',
    }) as const,
}

const fetchStashes = async (
  path: string,
  context: QueryFunctionContext,
): Promise<StashInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_stashes',
    { path },
    STASHES_SCHEMA,
    context,
  )

  return res.map((resItem) => ({
    ...resItem,
    timestamp: resItem.timestamp * MS_IN_SECOND,
  }))
}

const stashesQuery = (path: string) =>
  queryOptions({
    queryKey: [stashesQueryKeys.all(path)],
    queryFn: (context) => fetchStashes(path, context),
  })

const useQueryStashes = () => useRepositoryQuery(stashesQuery)

export { stashesQueryKeys, useQueryStashes }
