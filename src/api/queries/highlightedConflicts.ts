import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import type { HighlightedContent } from '@/highlighting/utils'
import { highlight } from '@/highlighting/utils'
import { MS_IN_MINUTE } from '@/utils/time'

import type { UnmergedFileInfo } from '../models'
import { useRepositoryQuery } from '../utils'
import { fileConflictsQuery, fileConflictsQueryKeys } from './fileConflicts'

const highlightedConflictsQueryKeys = {
  file: (repoPath: string, file: UnmergedFileInfo, showWordDiffs: boolean) =>
    ({
      ...fileConflictsQueryKeys.file(repoPath, file),
      variant: 'highlighted',
      showWordDiffs,
    }) as const,
}

const fetchHighlightedConflicts = async (
  repoPath: string,
  file: UnmergedFileInfo,
  showWordDiffs: boolean,
  context: QueryFunctionContext,
): Promise<HighlightedContent> => {
  const fileConflicts = await context.client.fetchQuery(
    fileConflictsQuery(repoPath, file),
  )

  return highlight(
    { type: 'conflicts', fileConflicts, path: file.path, showWordDiffs },
    context.signal,
  )
}

const highlightedConflictsQuery = (
  repoPath: string,
  file: UnmergedFileInfo,
  showWordDiffs: boolean,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: [
      highlightedConflictsQueryKeys.file(repoPath, file, showWordDiffs),
    ],
    queryFn: (context) =>
      fetchHighlightedConflicts(repoPath, file, showWordDiffs, context),
    gcTime: MS_IN_MINUTE,
    enabled,
  })

const useQueryHighlightedConflicts = (
  file: UnmergedFileInfo,
  showWordDiffs: boolean,
  enabled: boolean,
) => useRepositoryQuery(highlightedConflictsQuery, file, showWordDiffs, enabled)

export { highlightedConflictsQueryKeys, useQueryHighlightedConflicts }
