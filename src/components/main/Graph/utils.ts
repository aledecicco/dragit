import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect, useMemo } from 'react'

import type {
  BranchDivergence,
  BranchInfo,
  HistoryItem,
  Page,
} from '@api/models'
import {
  useQueryBranchDivergence,
  useQueryBranches,
  useQueryCommonAncestor,
  useQueryHeadInfo,
} from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { getCurrentBranchInfo, getRemoteCounterpart } from '@utils/repository'

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

const useCurrentBranch = (): BranchInfo | undefined => {
  const headInfoQuery = useQueryHeadInfo()
  const branchesQuery = useQueryBranches()

  const branch = useMemo(() => {
    return getCurrentBranchInfo(headInfoQuery.data, branchesQuery.data)
  }, [branchesQuery.data, headInfoQuery.data])

  return branch
}

const useCurrentCommonAncestor = () => {
  const { branch, baseBranch } = useSelectedBranches()
  const commonAncestorQuery = useQueryCommonAncestor(
    branch?.name,
    baseBranch?.name,
  )

  return commonAncestorQuery.data
}

const useRemoteDivergence = (
  branch: BranchInfo,
): BranchDivergence | undefined | null => {
  const divergenceQuery = useQueryBranchDivergence(
    branch.name,
    getRemoteCounterpart(branch),
  )

  return divergenceQuery.data
}

export {
  ancestorNotInRange,
  ancestorIsDivergent,
  useInfiniteScroll,
  useCurrentBranch,
  useCurrentCommonAncestor,
  useRemoteDivergence,
}
