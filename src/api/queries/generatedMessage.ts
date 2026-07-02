import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { GENERATED_COMMIT_MESSAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const generatedCommitMessageQueryKey = (repoPath: string) =>
  ({
    ...pathQueryKey(repoPath),
    key: 'generate_commit_message',
  }) as const

const fetchGeneratedCommitMessage = (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<string> => {
  return fetchAndDeserialize(
    'generate_commit_message',
    { repoPath },
    GENERATED_COMMIT_MESSAGE_SCHEMA,
    context,
  )
}

const generatedCommitMessageQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [generatedCommitMessageQueryKey(repoPath)],
    queryFn: (context) => fetchGeneratedCommitMessage(repoPath, context),
    enabled: false,
  })

const useQueryGeneratedCommitMessage = () =>
  useRepositoryQuery(generatedCommitMessageQuery)

export {
  generatedCommitMessageQuery,
  generatedCommitMessageQueryKey,
  useQueryGeneratedCommitMessage,
}
