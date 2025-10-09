import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import type { RemoteInfo } from '../models'
import { REMOTES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const remotesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'remotes',
    }) as const,
}

const fetchRemotes = (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<RemoteInfo[]> => {
  return fetchAndDeserialize(
    'get_remotes',
    { repoPath },
    REMOTES_SCHEMA,
    context,
  )
}

const remotesQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [remotesQueryKeys.all(repoPath)],
    queryFn: (context) => fetchRemotes(repoPath, context),
  })

const useQueryRemotes = () => useRepositoryQuery(remotesQuery)

export { remotesQueryKeys, useQueryRemotes }
