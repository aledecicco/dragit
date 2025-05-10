import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect } from 'react'

import type {
  AncestorInfo,
  BranchDivergence,
  HistoryItem,
  Page,
} from '@api/models'
import { HISTORY_PAGE_SIZE, useQueryCommonAncestor } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  getPaginatedLength,
} from '@api/utils'
import { useSelectedRefs } from '@context/branches'

type HistoryQuery = UseInfiniteQueryResult<InfiniteData<Page<HistoryItem>>>

const ancestorNotInRange = (
  ancestorDistance: number,
  historyQuery: HistoryQuery,
  items: VirtualItem[],
): boolean => {
  return (
    !items.find((virtualRow) => virtualRow.index === ancestorDistance) ||
    getPaginatedLength(historyQuery.data) <= ancestorDistance
  )
}

const ancestorIsDivergent = (
  ancestorDistance: number,
  branchDivergence: BranchDivergence,
): boolean => {
  return ancestorDistance + 1 <= branchDivergence.ahead
}

const useInfiniteScroll = (
  historyQuery: HistoryQuery,
  items: VirtualItem[],
) => {
  useEffect(() => {
    const lastItem = items.at(-1)

    if (
      lastItem &&
      lastItem.index >= getPaginatedLength(historyQuery.data) - 1 &&
      historyQuery.hasNextPage &&
      !historyQuery.isFetchingNextPage
    ) {
      historyQuery.fetchNextPage()
    }
  }, [
    items,
    historyQuery.hasNextPage,
    historyQuery.isFetchingNextPage,
    historyQuery.fetchNextPage,
    historyQuery.data,
  ])
}

const useCurrentCommonAncestor = () => {
  const { reference, baseReference } = useSelectedRefs()
  const commonAncestorQuery = useQueryCommonAncestor(
    reference?.refName,
    baseReference?.refName,
  )

  return commonAncestorQuery.data ?? undefined
}

const getGraphCommitData = (
  row: VirtualItem,
  history: InfiniteData<Page<HistoryItem>>,
  anchor: AncestorInfo | undefined | null,
) => {
  const hash =
    anchor && row.index === anchor.distance
      ? anchor.hash
      : getPaginatedItem(history, row.index, HISTORY_PAGE_SIZE)?.hash

  if (!hash) {
    return undefined
  }

  const isAnchor = !!anchor && hash === anchor.hash

  const parent =
    getNextPaginatedItem(history, row.index, HISTORY_PAGE_SIZE)?.hash ??
    (anchor && anchor.distance > row.index ? anchor.hash : undefined)

  return { hash, isAnchor, parent }
}

export {
  ancestorNotInRange,
  ancestorIsDivergent,
  useInfiniteScroll,
  useCurrentCommonAncestor,
  getGraphCommitData,
}
