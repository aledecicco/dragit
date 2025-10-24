import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { MS_IN_SECOND } from '@/utils/time'

import type { CommitId, CommitInfo } from '../models'
import { COMMIT_INFO_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const commitInfoQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'commit_info',
    }) as const,
  commit: (repoPath: string, commit: CommitId) =>
    ({
      ...commitInfoQueryKeys.all(repoPath),
      commit: commit,
    }) as const,
}

const fetchCommitInfo = async (
  repoPath: string,
  commitId: CommitId,
  context: QueryFunctionContext,
): Promise<CommitInfo> => {
  const res = await fetchAndDeserialize(
    'get_commit_info',
    { repoPath, reference: commitId },
    COMMIT_INFO_SCHEMA,
    context,
  )

  return {
    ...res,
    type: 'commit',
    timestamp: res.timestamp * MS_IN_SECOND,
  }
}

const commitInfoQuery = (repoPath: string, commitId: CommitId) =>
  queryOptions({
    queryKey: [commitInfoQueryKeys.commit(repoPath, commitId)],
    queryFn: (context) => fetchCommitInfo(repoPath, commitId, context),
  })

const useQueryCommitInfo = (commitId: CommitId) =>
  useRepositoryQuery(commitInfoQuery, commitId)

export { commitInfoQueryKeys, useQueryCommitInfo }
