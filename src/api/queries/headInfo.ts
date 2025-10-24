import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { HeadInfo } from '../models'
import { HEAD_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const headInfoQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'head_info',
    }) as const,
}

const fetchHeadInfo = async (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<HeadInfo> => {
  const res = await fetchAndDeserialize(
    'get_head_info',
    { repoPath },
    HEAD_INFO_SCHEMA,
    context,
  )

  return match(res)
    .returnType<HeadInfo>()
    .with({ Branch: { name: P.select() } }, (branchName) => ({
      type: 'branch',
      name: branchName,
    }))
    .with({ Detached: { commit: P.select() } }, (commit) => ({
      type: 'detached',
      commit: commit,
    }))
    .exhaustive()
}

const headInfoQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [headInfoQueryKeys.all(repoPath)],
    queryFn: (context) => fetchHeadInfo(repoPath, context),
  })

const useQueryHeadInfo = () => useRepositoryQuery(headInfoQuery)

export { headInfoQueryKeys, useQueryHeadInfo }
