import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect } from 'react'

import type {
  BranchDivergence,
  HistoryItem,
  Page,
  Reference,
} from '@api/models'
import { useQueryBranchDivergence, useQueryCommonAncestor } from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { useSelectedRefs } from '@context/branches'
import { getRemoteCounterpart, useBranch } from '@utils/repository'

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

const useRemoteDivergence = (
  reference: Reference,
): BranchDivergence | undefined | null => {
  const branch = useBranch(reference)

  const divergenceQuery = useQueryBranchDivergence(
    branch?.name,
    branch ? getRemoteCounterpart(branch) : undefined,
  )

  return divergenceQuery.data
}

export {
  ancestorNotInRange,
  ancestorIsDivergent,
  useInfiniteScroll,
  useCurrentCommonAncestor,
  useRemoteDivergence,
}
