import {
  type QueryFunctionContext,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'

import { RECENTLY_OPENED_SCHEMA } from '../schemas'
import { fetchAndDeserialize } from '../utils'

const recentlyOpenedQueryKey = ['recently_opened'] as const

const fetchRecentlyOpened = (
  context: QueryFunctionContext,
): Promise<string[]> => {
  return fetchAndDeserialize(
    'get_recently_opened',
    {},
    RECENTLY_OPENED_SCHEMA,
    context,
  )
}

const recentlyOpenedQuery = queryOptions({
  queryKey: recentlyOpenedQueryKey,
  queryFn: fetchRecentlyOpened,
})

const useQueryRecentlyOpened = () => useQuery(recentlyOpenedQuery)

export { recentlyOpenedQueryKey, useQueryRecentlyOpened }
