import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { HeadInfo, HeadState, WorktreeStatus } from '../models'
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

  return {
    state: match(res.state)
      .returnType<HeadState>()
      .with({ Branch: P.select() }, (headInfo) => ({
        type: 'branch',
        name: headInfo.name,
      }))
      .with({ Detached: { commit: P.select() } }, (commit) => ({
        type: 'detached',
        commit: commit,
      }))
      .exhaustive(),
    worktreeStatus: match(res.worktreeStatus)
      .returnType<WorktreeStatus>()
      .with({ Clean: {} }, () => 'clean')
      .with({ Merging: {} }, () => 'merging')
      .with({ Rebasing: {} }, () => 'rebasing')
      .with({ CherryPicking: {} }, () => 'cherry-picking')
      .with({ Reverting: {} }, () => 'reverting')
      .exhaustive(),
  }
}

const headInfoQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [headInfoQueryKeys.all(repoPath)],
    queryFn: (context) => fetchHeadInfo(repoPath, context),
  })

const useQueryHeadInfo = () => useRepositoryQuery(headInfoQuery)

export { headInfoQueryKeys, useQueryHeadInfo }
