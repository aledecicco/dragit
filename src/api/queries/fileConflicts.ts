import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { ConflictLine, FileConflicts, FileInfo } from '../models'
import { FILE_CONFLICTS_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const fileConflictsQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'file_conflicts',
    }) as const,
  file: (repoPath: string, filepath: string) =>
    ({
      ...fileConflictsQueryKeys.all(repoPath),
      filepath,
    }) as const,
}

const fetchFileConflicts = async (
  repoPath: string,
  filepath: string,
  context: QueryFunctionContext,
): Promise<FileConflicts> => {
  const res = await fetchAndDeserialize(
    'get_file_conflicts',
    {
      repoPath,
      filepath,
    },
    FILE_CONFLICTS_SCHEMA,
    context,
  )

  return res.map((resItem) =>
    match(resItem)
      .returnType<ConflictLine>()
      .with({ Ours: P.select() }, (line) => ({
        type: 'ours',
        content: line,
      }))
      .with({ Theirs: P.select() }, (line) => ({
        type: 'theirs',
        content: line,
      }))
      .with({ Unchanged: P.select() }, (line) => ({
        type: 'unchanged',
        content: line,
      }))
      .exhaustive(),
  )
}

const fileConflictsQuery = (repoPath: string, filepath: string) =>
  queryOptions({
    queryKey: [fileConflictsQueryKeys.file(repoPath, filepath)],
    queryFn: (context) => fetchFileConflicts(repoPath, filepath, context),
  })

const useQueryFileConflicts = (file: FileInfo) =>
  useRepositoryQuery(fileConflictsQuery, file.path)

export { fileConflictsQueryKeys, useQueryFileConflicts }
