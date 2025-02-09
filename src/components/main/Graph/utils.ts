import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useQuery,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect } from 'react'

import type { BranchName, HistoryItem } from '@api/models'
import { headInfoQuery } from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { match } from 'ts-pattern'

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

const useCurrentBranch = (path: string): BranchName | undefined => {
  const branch = useQuery({
    ...headInfoQuery(path),
    select: (headInfo) =>
      match(headInfo.status)
        .with({ type: 'branch' }, (head) => head.name)
        .with({ type: 'initial' }, (head) => head.branch)
        .otherwise(() => undefined),
  })

  return branch.data
}

export { ancestorNotInRange, useInfiniteScroll, useCurrentBranch }
