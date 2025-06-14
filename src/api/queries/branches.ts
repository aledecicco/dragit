import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import { MS_IN_SECOND } from '@/utils/time'

import type { BranchInfo, RemoteRef } from '../models'
import { BRANCHES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const branchesQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'branches',
    }) as const,
}

const fetchBranches = async (
  path: string,
  context: QueryFunctionContext,
): Promise<BranchInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_branches',
    { path },
    BRANCHES_SCHEMA,
    context,
  )

  return res.map((resItem) =>
    match(resItem)
      .returnType<BranchInfo>()
      .with({ Local: P.select() }, (branch) => ({
        type: 'local',
        name: branch.name,
        timestamp: branch.timestamp * MS_IN_SECOND,
        remote: branch.remote,
      }))
      .with({ Remote: P.select() }, (branch) => ({
        type: 'remote',
        name: branch.name as RemoteRef,
        timestamp: branch.timestamp * MS_IN_SECOND,
      }))
      .exhaustive(),
  )
}

const branchesQuery = (path: string) =>
  queryOptions({
    queryKey: [branchesQueryKeys.all(path)],
    queryFn: (context) => fetchBranches(path, context),
  })

const useQueryBranches = () => useRepositoryQuery(branchesQuery)

export { branchesQueryKeys, useQueryBranches }
