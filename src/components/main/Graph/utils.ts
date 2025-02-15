import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useQuery,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEffect, useMemo } from 'react'
import { match } from 'ts-pattern'

import type { BranchDivergence, BranchInfo, HistoryItem } from '@api/models'
import {
  branchDivergenceQuery,
  branchesQuery,
  headInfoQuery,
} from '@api/queries'
import { getPaginatedLength } from '@api/utils'

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

const useCurrentBranch = (path: string): BranchInfo | undefined => {
  const branches = useQuery(branchesQuery(path))
  const headInfo = useQuery(headInfoQuery(path))

  const branch = useMemo(() => {
    const branchName = match(headInfo.data?.status)
      .with({ type: 'branch' }, (head) => head.name)
      .with({ type: 'initial' }, (head) => head.branch)
      .otherwise(() => undefined)

    return branchName
      ? branches.data?.find((branch) => branch.name === branchName)
      : undefined
  }, [branches.data, headInfo.data])

  return branch
}

const useRemoteDivergence = (
  path: string,
  branch: BranchInfo,
): BranchDivergence | undefined => {
  const divergence = useQuery(
    branchDivergenceQuery(
      path,
      branch.name,
      branch.type === 'local' && !!branch.remote
        ? `${branch.remote.remoteName}/${branch.remote.branchName}`
        : undefined,
    ),
  )

  return divergence.data
}

export {
  ancestorNotInRange,
  useInfiniteScroll,
  useCurrentBranch,
  useRemoteDivergence,
}
