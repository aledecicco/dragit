import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { pathQueryKey } from '.'
import type { RemoteInfo } from '../models'
import { REMOTES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

const remotesQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'remotes',
    }) as const,
}

const fetchRemotes = (
  path: string,
  context: QueryFunctionContext,
): Promise<RemoteInfo[]> => {
  return fetchAndDeserialize('get_remotes', { path }, REMOTES_SCHEMA, context)
}

const remotesQuery = (path: string) =>
  queryOptions({
    queryKey: [remotesQueryKeys.all(path)],
    queryFn: (context) => fetchRemotes(path, context),
  })

const useQueryRemotes = () => useRepositoryQuery(remotesQuery)

export { remotesQueryKeys, useQueryRemotes }
