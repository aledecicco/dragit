import { useEffect } from 'react'
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { VirtualItem } from '@tanstack/react-virtual'

import type {
  AncestorInfo,
  BranchDivergence,
  BranchInfo,
  CommonAncestorInfo,
  HistoryItem,
  Page,
  Reference,
  RefName,
} from '@/api/models'
import { HISTORY_PAGE_SIZE } from '@/api/queries/commitHistory'
import { useQueryCommonAncestor } from '@/api/queries/commonAncestor'
import { getPaginatedItem, getPaginatedLength } from '@/api/utils'
import { useSelectedReferences } from '@/context/branches'
import type { ComboboxOption } from '@/ui/Combobox'

type HistoryQuery = UseInfiniteQueryResult<InfiniteData<Page<HistoryItem>>>

/**
 * Whether an ancestor at a given distance is not amongst the currently loaded items.
 *
 * @param ancestorDistance - The distance from the branch's tip of the ancestor to search for.
 * @param historyQuery - The query containing the commit history.
 * @param items - The currently rendered items in the virtual list.
 */
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

/**
 * Whether an ancestor is "ahead" of a given branch's tip.
 *
 * @param ancestorDistance - The distance from the branch's tip of the ancestor to check.
 * @param branchDivergence - The computed divergence info about the branch.
 */
const ancestorIsDivergent = (
  ancestorDistance: number,
  branchDivergence: BranchDivergence,
): boolean => {
  return ancestorDistance + 1 <= branchDivergence.ahead
}

/**
 * Hook that automatically fetches the next page of the given query when the virtual list reaches the end.
 *
 * @param historyQuery - The query containing the commit history.
 * @param items - The currently rendered items in the virtual list.
 */
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

/**
 * Tracks the two selected refs and returns information about their common ancestor.
 */
const useCurrentCommonAncestor = (): CommonAncestorInfo | undefined => {
  const { currentReference, baseReference } = useSelectedReferences()
  const commonAncestorQuery = useQueryCommonAncestor(
    currentReference?.refName,
    baseReference?.refName,
  )

  return commonAncestorQuery.data ?? undefined
}

/**
 * Computes and returns information useful to render a commit in the graph.
 *
 * @param row - The row representing a commit in the virtual list.
 * @param history - The commit history.
 * @param anchor - The ancestor being used as anchor between the two selected refs.
 *
 * @returns An object containing:
 * - `hash`: The commit's hash.
 * - `isAnchor`: Whether the commit is the anchor commit.
 * - `parent`: The commit's parent hash. Can skip to the anchor commit if the intermediate commits are not loaded.
 */
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
    getPaginatedItem(history, row.index + 1, HISTORY_PAGE_SIZE)?.hash ??
    (anchor && anchor.distance > row.index ? anchor.hash : undefined)

  return { hash, isAnchor, parent }
}

/**
 * Generates the appropriate options for the current branch selector.
 *
 * @param branches The list of all available branches.
 *
 * @returns An array of combobox options.
 */
const getCurrentBranchOptions = (
  branches: BranchInfo[],
): ComboboxOption<BranchInfo>[] => {
  return (
    branches?.map((branch) => {
      const option = {
        value: branch.name,
        data: branch,
      }
      return option
    }) ?? []
  )
}

/**
 * Generates the appropriate options for the base branch selector based on the provided config.
 *
 * @param branches The list of all available branches.
 * @param exclude An optional name to exclude from the options.
 * @param include An optional reference to always include in the options.
 *
 * @returns An array of combobox options.
 */
const getBaseBranchOptions = (
  branches: BranchInfo[],
  exclude?: RefName,
  include?: Reference,
): ComboboxOption<Reference | null>[] => {
  let options =
    branches?.map((branch) => {
      const option = {
        value: branch.name,
        data: { type: 'branch', refName: branch.name } as Reference | null,
      }
      return option
    }) ?? []

  options.unshift({ value: '', data: null })

  if (exclude) {
    options = options.filter((option) => option.value !== exclude)
  }

  if (include) {
    const isIncluded = options.some(
      (option) => option.value === include.refName,
    )
    if (!isIncluded) {
      options.unshift({
        value: include.refName,
        data: include,
      })
    }
  }

  return options
}

export {
  ancestorNotInRange,
  ancestorIsDivergent,
  useInfiniteScroll,
  useCurrentCommonAncestor,
  getGraphCommitData,
  getCurrentBranchOptions,
  getBaseBranchOptions,
}
