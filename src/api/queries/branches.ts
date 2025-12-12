import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import { MS_IN_SECOND } from '@/utils/time'

import type { BranchInfo, BranchType, RemoteRef } from '../models'
import { BRANCHES_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const branchesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'branches',
    }) as const,
}

const fetchBranches = async (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<BranchInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_branches',
    { repoPath },
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
        upstream: branch.upstream,
      }))
      .with({ Remote: P.select() }, (branch) => ({
        type: 'remote',
        name: branch.name as RemoteRef,
        timestamp: branch.timestamp * MS_IN_SECOND,
      }))
      .exhaustive(),
  )
}

const branchesQuery = (repoPath: string, type?: BranchType) =>
  queryOptions({
    queryKey: [branchesQueryKeys.all(repoPath)],
    queryFn: (context) => fetchBranches(repoPath, context),
    select: (branches) =>
      type ? branches.filter((branch) => branch.type === type) : branches,
  })

const useQueryBranches = (type?: BranchType) =>
  useRepositoryQuery(branchesQuery, type)

export { branchesQueryKeys, useQueryBranches }
