import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect } from 'react'

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

const useInfiniteScroll = (
  history: HistoryQuery,
  items: VirtualItem[],
  fetchCondition?: () => boolean,
) => {
  useEffect(() => {
    const lastItem = items.at(-1)

    if (
      (!fetchCondition || fetchCondition()) &&
      lastItem &&
      lastItem.index >= getPaginatedLength(history) - 1 &&
      history.hasNextPage &&
      !history.isFetchingNextPage
    ) {
      history.fetchNextPage()
    }
  }, [items, history, fetchCondition])
}

export { ancestorNotInRange, useInfiniteScroll }
