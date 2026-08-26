import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import type { DiffFilter, HighlightedContent } from '@/highlighting/utils'
import { highlight } from '@/highlighting/utils'
import { MS_IN_MINUTE } from '@/utils/time'

import type { DiffScope } from '../models'
import { useRepositoryQuery } from '../utils'
import { fileDiffQuery, fileDiffQueryKeys } from './fileDiff'

/**
 * Keys extend the ones of the diff they are built from, so that anything
 * invalidating a diff invalidates its highlighted contents as well.
 */
const highlightedDiffQueryKeys = {
  file: (
    repoPath: string,
    scope: DiffScope,
    filter: DiffFilter,
    showWordDiffs: boolean,
  ) =>
    ({
      ...fileDiffQueryKeys.file(repoPath, scope),
      variant: 'highlighted',
      filter,
      showWordDiffs,
    }) as const,
}

const fetchHighlightedDiff = async (
  repoPath: string,
  scope: DiffScope,
  filepath: string,
  filter: DiffFilter,
  showWordDiffs: boolean,
  context: QueryFunctionContext,
): Promise<HighlightedContent> => {
  const fileDiff = await context.client.fetchQuery(
    fileDiffQuery(repoPath, scope),
  )

  return highlight(
    { type: 'diff', fileDiff, path: filepath, filter, showWordDiffs },
    context.signal,
  )
}

const highlightedDiffQuery = (
  repoPath: string,
  scope: DiffScope,
  filepath: string,
  filter: DiffFilter,
  showWordDiffs: boolean,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: [
      highlightedDiffQueryKeys.file(repoPath, scope, filter, showWordDiffs),
    ],
    queryFn: (context) =>
      fetchHighlightedDiff(
        repoPath,
        scope,
        filepath,
        filter,
        showWordDiffs,
        context,
      ),
    gcTime: MS_IN_MINUTE,
    enabled,
  })

const useQueryHighlightedDiff = (
  scope: DiffScope,
  filepath: string,
  filter: DiffFilter,
  showWordDiffs: boolean,
  enabled: boolean,
) =>
  useRepositoryQuery(
    highlightedDiffQuery,
    scope,
    filepath,
    filter,
    showWordDiffs,
    enabled,
  )

export { highlightedDiffQueryKeys, useQueryHighlightedDiff }
