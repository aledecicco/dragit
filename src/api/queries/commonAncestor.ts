import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import type { CommonAncestorInfo } from '../models'
import { COMMON_ANCESTOR_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const commonAncestorQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'common_ancestor',
    }) as const,
  reference: (repoPath: string, reference: string | undefined) =>
    ({
      ...commonAncestorQueryKeys.all(repoPath),
      reference: reference,
    }) as const,
  baseReference: (repoPath: string, baseReference: string | undefined) =>
    ({
      ...commonAncestorQueryKeys.all(repoPath),
      baseReference: baseReference,
    }) as const,
  pair: (
    repoPath: string,
    reference: string | undefined,
    baseReference: string | undefined,
  ) =>
    ({
      ...commonAncestorQueryKeys.reference(repoPath, reference),
      ...commonAncestorQueryKeys.baseReference(repoPath, baseReference),
    }) as const,
}

const fetchCommonAncestor = async (
  repoPath: string,
  refName: string,
  baseRefName: string,
  context: QueryFunctionContext,
): Promise<CommonAncestorInfo | undefined> => {
  const res = await fetchAndDeserialize(
    'get_common_ancestor',
    { repoPath, referenceA: refName, referenceB: baseRefName },
    COMMON_ANCESTOR_INFO_SCHEMA,
    context,
  )

  return res ?? undefined
}

const commonAncestorQuery = (
  repoPath: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [commonAncestorQueryKeys.pair(repoPath, refName, baseRefName)],
    queryFn:
      refName && baseRefName
        ? (context) =>
            fetchCommonAncestor(repoPath, refName, baseRefName, context)
        : skipToken,
  })

const useQueryCommonAncestor = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(commonAncestorQuery, refName, baseRefName)

export { commonAncestorQueryKeys, useQueryCommonAncestor }
