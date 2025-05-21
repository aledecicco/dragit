import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import { pathQueryKey } from '.'
import type { BranchDivergence, BranchName } from '../models'
import { BRANCH_DIVERGENCE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

const branchDivergenceQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'branch_divergence',
    }) as const,
  branch: (path: string, branch: BranchName | undefined) =>
    ({
      ...branchDivergenceQueryKeys.all(path),
      branch: branch,
    }) as const,
  baseBranch: (path: string, baseBranch: BranchName | undefined) =>
    ({
      ...branchDivergenceQueryKeys.all(path),
      baseBranch: baseBranch,
    }) as const,
  pair: (
    path: string,
    branch: BranchName | undefined,
    baseBranch: BranchName | undefined,
  ) =>
    ({
      ...branchDivergenceQueryKeys.branch(path, branch),
      ...branchDivergenceQueryKeys.baseBranch(path, baseBranch),
    }) as const,
}

const fetchBranchDivergence = (
  path: string,
  branch: BranchName,
  baseBranch: BranchName,
  context: QueryFunctionContext,
): Promise<BranchDivergence> => {
  return fetchAndDeserialize(
    'get_branch_divergence',
    { path, branch, baseBranch },
    BRANCH_DIVERGENCE_SCHEMA,
    context,
  )
}

const branchDivergenceQuery = (
  path: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [branchDivergenceQueryKeys.pair(path, refName, baseRefName)],
    queryFn:
      refName && baseRefName
        ? (context) =>
            fetchBranchDivergence(path, refName, baseRefName, context)
        : skipToken,
  })

const useQueryBranchDivergence = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(branchDivergenceQuery, refName, baseRefName)

export { branchDivergenceQueryKeys, useQueryBranchDivergence }
