import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type { ConflictLine, FileConflicts, UnmergedFileInfo } from '../models'
import { FILE_CONFLICTS_SCHEMA } from '../schemas'
import { serializeUnmergedFile } from '../serialization'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

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
  file: UnmergedFileInfo,
  context: QueryFunctionContext,
): Promise<FileConflicts> => {
  const res = await fetchAndDeserialize(
    'get_file_conflicts',
    {
      repoPath,
      file: serializeUnmergedFile(file),
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

const fileConflictsQuery = (repoPath: string, file: UnmergedFileInfo) =>
  queryOptions({
    queryKey: [fileConflictsQueryKeys.file(repoPath, file.path)],
    queryFn: (context) => fetchFileConflicts(repoPath, file, context),
  })

const useQueryFileConflicts = (file: UnmergedFileInfo) =>
  useRepositoryQuery(fileConflictsQuery, file)

export { fileConflictsQueryKeys, useQueryFileConflicts }
