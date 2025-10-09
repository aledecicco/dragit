import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { DiffLine, DiffScope, FileDiff } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const filesDiffQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'file_diff',
    }) as const,
  scope: (repoPath: string, scope: DiffScope) =>
    ({
      ...filesDiffQueryKeys.all(repoPath),
      scope,
    }) as const,
  file: (repoPath: string, filepath: string | undefined, scope: DiffScope) =>
    ({
      ...filesDiffQueryKeys.scope(repoPath, scope),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  repoPath: string,
  filepath: string,
  scope: DiffScope,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      repoPath,
      filepath,
      scope,
    },
    FILE_DIFF_SCHEMA,
    context,
  )

  return res.map((resItem) =>
    match(resItem)
      .returnType<DiffLine>()
      .with({ Added: P.select() }, (line) => ({
        type: 'added',
        content: line,
      }))
      .with({ Removed: P.select() }, (line) => ({
        type: 'removed',
        content: line,
      }))
      .with({ Unchanged: P.select() }, (line) => ({
        type: 'unchanged',
        content: line,
      }))
      .exhaustive(),
  )
}

const fileDiffQuery = (
  repoPath: string,
  filepath: string | undefined,
  scope: DiffScope,
) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(repoPath, filepath, scope)],
    queryFn: filepath
      ? (context) => fetchFileDiff(repoPath, filepath, scope, context)
      : skipToken,
  })

const useQueryFileDiff = (filepath: string | undefined, scope: DiffScope) =>
  useRepositoryQuery(fileDiffQuery, filepath, scope)

export { filesDiffQueryKeys, useQueryFileDiff }
