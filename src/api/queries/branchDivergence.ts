import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import type { BranchDivergence, BranchName } from '../models'
import { BRANCH_DIVERGENCE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const branchDivergenceQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'branch_divergence',
    }) as const,
  branch: (repoPath: string, branch: BranchName | undefined) =>
    ({
      ...branchDivergenceQueryKeys.all(repoPath),
      branch: branch,
    }) as const,
  baseBranch: (repoPath: string, baseBranch: BranchName | undefined) =>
    ({
      ...branchDivergenceQueryKeys.all(repoPath),
      baseBranch: baseBranch,
    }) as const,
  pair: (
    repoPath: string,
    branch: BranchName | undefined,
    baseBranch: BranchName | undefined,
  ) =>
    ({
      ...branchDivergenceQueryKeys.branch(repoPath, branch),
      ...branchDivergenceQueryKeys.baseBranch(repoPath, baseBranch),
    }) as const,
}

const fetchBranchDivergence = (
  repoPath: string,
  branch: BranchName,
  baseBranch: BranchName,
  context: QueryFunctionContext,
): Promise<BranchDivergence> => {
  return fetchAndDeserialize(
    'get_branch_divergence',
    { repoPath, branch, baseBranch },
    BRANCH_DIVERGENCE_SCHEMA,
    context,
  )
}

const branchDivergenceQuery = (
  repoPath: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [branchDivergenceQueryKeys.pair(repoPath, refName, baseRefName)],
    queryFn:
      refName && baseRefName
        ? (context) =>
            fetchBranchDivergence(repoPath, refName, baseRefName, context)
        : skipToken,
  })

const useQueryBranchDivergence = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(branchDivergenceQuery, refName, baseRefName)

export { branchDivergenceQueryKeys, useQueryBranchDivergence }
