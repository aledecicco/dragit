import type { UseQueryResult } from '@tanstack/react-query'

import type { BranchInfo, TagInfo } from '@/api/models'
import { useSettings } from '@/state/storage'

/**
 * Gets and sorts items in a query depending on the settings.
 */
export const useQueryItems = <T extends BranchInfo | TagInfo>(
  query: UseQueryResult<T[]>,
): T[] | undefined => {
  const settings = useSettings()

  const newItems = query.data ? [...query.data] : undefined

  const items = settings.sortBranchesByDate
    ? newItems?.sort((a, b) => b.timestamp - a.timestamp)
    : query.data

  return items
}
