import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

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
  commit: (repoPath: string, commit: CommitId | undefined) =>
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

const commitInfoQuery = (repoPath: string, commitId: CommitId | undefined) =>
  queryOptions({
    queryKey: [commitInfoQueryKeys.commit(repoPath, commitId)],
    queryFn: commitId
      ? (context) => fetchCommitInfo(repoPath, commitId, context)
      : skipToken,
  })

const useQueryCommitInfo = (commitId: CommitId | undefined) =>
  useRepositoryQuery(commitInfoQuery, commitId)

export { commitInfoQueryKeys, useQueryCommitInfo }
