import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import type { HighlightedContent } from '@/highlighting/utils'
import { highlight } from '@/highlighting/utils'
import { MS_IN_MINUTE } from '@/utils/time'

import type { UnmergedFileInfo } from '../models'
import { useRepositoryQuery } from '../utils'
import { fileConflictsQuery, fileConflictsQueryKeys } from './fileConflicts'

/**
 * Keys extend the ones of the conflicts they are built from, so that anything
 * invalidating conflicts invalidates their highlighted contents as well.
 */
const highlightedConflictsQueryKeys = {
  file: (repoPath: string, filepath: string) =>
    ({
      ...fileConflictsQueryKeys.file(repoPath, filepath),
      variant: 'highlighted',
    }) as const,
}

const fetchHighlightedConflicts = async (
  repoPath: string,
  file: UnmergedFileInfo,
  context: QueryFunctionContext,
): Promise<HighlightedContent> => {
  const fileConflicts = await context.client.fetchQuery(
    fileConflictsQuery(repoPath, file),
  )

  return highlight(
    { type: 'conflicts', fileConflicts, path: file.path },
    context.signal,
  )
}

const highlightedConflictsQuery = (repoPath: string, file: UnmergedFileInfo) =>
  queryOptions({
    queryKey: [highlightedConflictsQueryKeys.file(repoPath, file.path)],
    queryFn: (context) => fetchHighlightedConflicts(repoPath, file, context),
    gcTime: MS_IN_MINUTE,
  })

const useQueryHighlightedConflicts = (file: UnmergedFileInfo) =>
  useRepositoryQuery(highlightedConflictsQuery, file)

export { highlightedConflictsQueryKeys, useQueryHighlightedConflicts }
