import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { MS_IN_SECOND } from '@utils/time'
import { pathQueryKey } from '.'
import type { CommitId, CommitInfo } from '../models'
import { COMMIT_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

const commitInfoQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'commit_info',
    }) as const,
  commit: (path: string, commit: CommitId) =>
    ({
      ...commitInfoQueryKeys.all(path),
      commit: commit,
    }) as const,
}

const fetchCommitInfo = async (
  path: string,
  commitId: CommitId,
  context: QueryFunctionContext,
): Promise<CommitInfo> => {
  const res = await fetchAndDeserialize(
    'get_commit_info',
    { path, reference: commitId },
    COMMIT_INFO_SCHEMA,
    context,
  )

  return {
    ...res,
    timestamp: res.timestamp * MS_IN_SECOND,
  }
}

const commitInfoQuery = (path: string, commitId: CommitId) =>
  queryOptions({
    queryKey: [commitInfoQueryKeys.commit(path, commitId)],
    queryFn: (context) => fetchCommitInfo(path, commitId, context),
  })

const useQueryCommitInfo = (commitId: CommitId) =>
  useRepositoryQuery(commitInfoQuery, commitId)

export { commitInfoQueryKeys, useQueryCommitInfo }
