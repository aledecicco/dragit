import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import { pathQueryKey } from '.'
import type { CommonAncestorInfo } from '../models'
import { COMMON_ANCESTOR_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

const commonAncestorQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'common_ancestor',
    }) as const,
  reference: (path: string, reference: string | undefined) =>
    ({
      ...commonAncestorQueryKeys.all(path),
      reference: reference,
    }) as const,
  baseReference: (path: string, baseReference: string | undefined) =>
    ({
      ...commonAncestorQueryKeys.all(path),
      baseReference: baseReference,
    }) as const,
  pair: (
    path: string,
    reference: string | undefined,
    baseReference: string | undefined,
  ) =>
    ({
      ...commonAncestorQueryKeys.reference(path, reference),
      ...commonAncestorQueryKeys.baseReference(path, baseReference),
    }) as const,
}

const fetchCommonAncestor = (
  path: string,
  refName: string,
  baseRefName: string,
  context: QueryFunctionContext,
): Promise<CommonAncestorInfo | null> => {
  return fetchAndDeserialize(
    'get_common_ancestor',
    { path, referenceA: refName, referenceB: baseRefName },
    COMMON_ANCESTOR_INFO_SCHEMA,
    context,
  )
}

const commonAncestorQuery = (
  path: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [commonAncestorQueryKeys.pair(path, refName, baseRefName)],
    queryFn:
      refName && baseRefName
        ? (context) => fetchCommonAncestor(path, refName, baseRefName, context)
        : skipToken,
  })

const useQueryCommonAncestor = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(commonAncestorQuery, refName, baseRefName)

export { commonAncestorQueryKeys, useQueryCommonAncestor }
