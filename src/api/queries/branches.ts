import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
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

const branchesQuery = <T extends BranchType>(repoPath: string, type?: T) =>
  queryOptions({
    queryKey: [branchesQueryKeys.all(repoPath)],
    queryFn: (context) => fetchBranches(repoPath, context),
    select: (branches) =>
      type
        ? (branches.filter((branch) => branch.type === type) as Extract<
            BranchInfo,
            { type: T }
          >[])
        : branches,
  })

function useQueryBranches(
  type: 'local',
): UseQueryResult<Extract<BranchInfo, { type: 'local' }>[]>
function useQueryBranches(
  type: 'remote',
): UseQueryResult<Extract<BranchInfo, { type: 'remote' }>[]>
function useQueryBranches(type?: BranchType): UseQueryResult<BranchInfo[]>
function useQueryBranches<T extends BranchType>(type?: T) {
  return useRepositoryQuery(branchesQuery<T>, type)
}

export { branchesQueryKeys, useQueryBranches }
