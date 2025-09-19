import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { DiffLine, FileDiff } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const filesDiffQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'file_diff',
    }) as const,
  reference: (path: string, reference: string | undefined) =>
    ({
      ...filesDiffQueryKeys.all(path),
      reference: reference,
    }) as const,
  file: (
    path: string,
    reference: string | undefined,
    filepath: string | undefined,
  ) =>
    ({
      ...filesDiffQueryKeys.reference(path, reference),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  path: string,
  reference: string,
  filepath: string,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      path,
      reference,
      filepath,
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
  reference: string | undefined,
  filepath: string | undefined,
) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(path, reference, filepath)],
    queryFn:
      !!reference && !!filepath
        ? (context) => fetchFileDiff(path, reference, filepath, context)
        : skipToken,
  })

const useQueryFileDiff = (
  reference: string | undefined,
  filediff: string | undefined,
) => useRepositoryQuery(fileDiffQuery, reference, filediff)

export { filesDiffQueryKeys, useQueryFileDiff }
