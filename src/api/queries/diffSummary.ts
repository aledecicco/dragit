import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import type { DiffSummary, RefName } from '../models'
import { DIFF_SUMMARY_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const diffSummaryQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'diff_summary',
    }) as const,
  comparison: (
    repoPath: string,
    reference: RefName | undefined,
    against: RefName | undefined,
  ) =>
    ({
      ...diffSummaryQueryKeys.all(repoPath),
      reference,
      against,
    }) as const,
}

const fetchDiffSummary = (
  repoPath: string,
  reference: RefName,
  against: RefName | undefined,
  context: QueryFunctionContext,
): Promise<DiffSummary> =>
  fetchAndDeserialize(
    'get_diff_summary',
    { repoPath, reference, against: against ?? null },
    DIFF_SUMMARY_SCHEMA,
    context,
  )

const diffSummaryQuery = (
  repoPath: string,
  reference: RefName | undefined,
  against: RefName | undefined,
) =>
  queryOptions({
    queryKey: [diffSummaryQueryKeys.comparison(repoPath, reference, against)],
    queryFn: reference
      ? (context) => fetchDiffSummary(repoPath, reference, against, context)
      : skipToken,
  })

const useQueryDiffSummary = (reference: RefName, against?: RefName) =>
  useRepositoryQuery(diffSummaryQuery, reference, against)

export { diffSummaryQueryKeys, useQueryDiffSummary }
