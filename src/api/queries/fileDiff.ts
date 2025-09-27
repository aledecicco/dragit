import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { DiffLine, FileDiff, SnapshotId } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const filesDiffQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'file_diff',
    }) as const,
  snapshot: (path: string, snapshot: SnapshotId | undefined) =>
    ({
      ...filesDiffQueryKeys.all(path),
      snapshot,
    }) as const,
  file: (
    path: string,
    snapshot: SnapshotId | undefined,
    filepath: string | undefined,
  ) =>
    ({
      ...filesDiffQueryKeys.snapshot(path, snapshot),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  path: string,
  snapshotId: SnapshotId,
  filepath: string,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      path,
      snapshotId,
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
  snapshotId: SnapshotId | undefined,
  filepath: string | undefined,
) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(path, snapshotId, filepath)],
    queryFn:
      !!snapshotId && !!filepath
        ? (context) => fetchFileDiff(path, snapshotId, filepath, context)
        : skipToken,
  })

const useQueryFileDiff = (
  snapshotId: SnapshotId | undefined,
  filediff: string | undefined,
) => useRepositoryQuery(fileDiffQuery, snapshotId, filediff)

export { filesDiffQueryKeys, useQueryFileDiff }
