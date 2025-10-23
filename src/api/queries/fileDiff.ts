import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { DiffLine, DiffScope, FileDiff } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import {
  serializeUnmergedFile,
  serializeVersionedFile,
  serializeWorktreeFile,
} from '../serialization'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const fileDiffQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'file_diff',
    }) as const,
  file: (repoPath: string, scope: DiffScope) =>
    ({
      ...fileDiffQueryKeys.all(repoPath),
      scope,
    }) as const,
}

const fetchFileDiff = async (
  repoPath: string,
  scope: DiffScope,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      repoPath,
      scope: {
        ...scope,
        file: match(scope)
          .with({ type: 'worktree', file: P.select() }, (file) =>
            serializeWorktreeFile(file),
          )
          .with({ type: 'unmerged', file: P.select() }, (file) =>
            serializeUnmergedFile(file),
          )
          .with({ type: 'snapshot', file: P.select() }, (file) =>
            serializeVersionedFile(file),
          )
          .exhaustive(),
      },
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

const fileDiffQuery = (repoPath: string, scope: DiffScope) =>
  queryOptions({
    queryKey: [fileDiffQueryKeys.file(repoPath, scope)],
    queryFn: (context) => fetchFileDiff(repoPath, scope, context),
  })

const useQueryFileDiff = (scope: DiffScope) =>
  useRepositoryQuery(fileDiffQuery, scope)

export { fileDiffQueryKeys, useQueryFileDiff }
