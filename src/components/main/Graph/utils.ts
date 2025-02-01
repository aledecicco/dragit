import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'

import type { HistoryItem } from '@api/models'
import { getPaginatedLength } from '@api/utils'

type HistoryQuery = UseInfiniteQueryResult<InfiniteData<HistoryItem[]>>

const ancestorNotInRange = (
  ancestorDistance: number,
  history: HistoryQuery,
  items: VirtualItem[],
) => {
  return (
    !items.find((virtualRow) => virtualRow.index === ancestorDistance) ||
    getPaginatedLength(history) <= ancestorDistance
  )
}

export { ancestorNotInRange }
