import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo } from 'react'

import type { BranchDivergence, BranchInfo, HistoryItem } from '@api/models'
import {
  branchDivergenceQuery,
  branchesQuery,
  headInfoQuery,
} from '@api/queries'
import { getPaginatedLength, useRepositoryQuery } from '@api/utils'
import { getCurrentBranchInfo, getRemoteCounterpart } from '@utils/repository'
import { CURVE_SIZE } from './Edges'

type HistoryQuery = UseInfiniteQueryResult<InfiniteData<HistoryItem[]>>

const ancestorNotInRange = (
  ancestorDistance: number,
  history: HistoryQuery,
  items: VirtualItem[],
): boolean => {
  return (
    !items.find((virtualRow) => virtualRow.index === ancestorDistance) ||
    getPaginatedLength(history) <= ancestorDistance
  )
}

const ancestorIsDivergent = (
  ancestorDistance: number,
  branchDivergence: BranchDivergence,
): boolean => {
  return ancestorDistance + 1 <= branchDivergence.ahead
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

const useCurrentBranch = (): BranchInfo | undefined => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  const branches = useRepositoryQuery(branchesQuery)

  const branch = useMemo(() => {
    return getCurrentBranchInfo(headInfo.data, branches.data)
  }, [branches.data, headInfo.data])

  return branch
}

const useRemoteDivergence = (
  branch: BranchInfo,
): BranchDivergence | undefined => {
  const divergence = useRepositoryQuery(
    branchDivergenceQuery,
    branch.name,
    getRemoteCounterpart(branch),
  )

  return divergence.data
}

const getCommitPositionClass = (isBase: boolean) =>
  isBase ? 'left-[62%]' : 'left-[8%]'

const getCommitTranslationY = (
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  distance: number,
): number => {
  return (
    (virtualizer.options.gap + virtualizer.options.estimateSize(distance)) *
      distance +
    CURVE_SIZE * 2.25
  )
}

export {
  ancestorNotInRange,
  ancestorIsDivergent,
  useInfiniteScroll,
  useCurrentBranch,
  useRemoteDivergence,
  getCommitPositionClass,
  getCommitTranslationY,
}
