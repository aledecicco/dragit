import {
  type QueryFunctionContext,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'

import type { CurrentDirInfo } from '../models'
import { CURRENT_DIR_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize } from '../utils'

const currentDirQueryKey = { key: 'current_dir' } as const

const fetchCurrentDir = (
  context: QueryFunctionContext,
): Promise<CurrentDirInfo | null> => {
  return fetchAndDeserialize(
    'get_current_dir',
    {},
    CURRENT_DIR_INFO_SCHEMA,
    context,
  )
}

const currentDirQuery = queryOptions({
  queryKey: [currentDirQueryKey],
  queryFn: fetchCurrentDir,
})

const useQueryCurrentDir = () => useQuery(currentDirQuery)

export { currentDirQuery, currentDirQueryKey, useQueryCurrentDir }
