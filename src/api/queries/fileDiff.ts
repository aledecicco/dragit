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
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'file_diff',
    }) as const,
  scope: (path: string, scope: DiffScope) =>
    ({
      ...filesDiffQueryKeys.all(path),
      scope,
    }) as const,
  file: (path: string, filepath: string | undefined, scope: DiffScope) =>
    ({
      ...filesDiffQueryKeys.scope(path, scope),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  path: string,
  filepath: string,
  scope: DiffScope,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      path,
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
  path: string,
  filepath: string | undefined,
  scope: DiffScope,
) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(path, filepath, scope)],
    queryFn: filepath
      ? (context) => fetchFileDiff(path, filepath, scope, context)
      : skipToken,
  })

const useQueryFileDiff = (filepath: string | undefined, scope: DiffScope) =>
  useRepositoryQuery(fileDiffQuery, filepath, scope)

export { filesDiffQueryKeys, useQueryFileDiff }
