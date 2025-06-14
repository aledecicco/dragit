import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { HeadInfo } from '../models'
import { HEAD_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const headInfoQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'head_info',
    }) as const,
}

const fetchHeadInfo = async (
  path: string,
  context: QueryFunctionContext,
): Promise<HeadInfo> => {
  const res = await fetchAndDeserialize(
    'get_head_info',
    { path },
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

const headInfoQuery = (path: string) =>
  queryOptions({
    queryKey: [headInfoQueryKeys.all(path)],
    queryFn: (context) => fetchHeadInfo(path, context),
  })

const useQueryHeadInfo = () => useRepositoryQuery(headInfoQuery)

export { headInfoQueryKeys, useQueryHeadInfo }
