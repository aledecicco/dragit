import type { Virtualizer } from '@tanstack/react-virtual'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { HISTORY_PAGE_SIZE, useQueryCommitHistory } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

type GraphBranchProps = {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  anchor: AncestorInfo | undefined | null
} & (
  | {
      isBase?: false
      baseBranch: BranchInfo | undefined
    }
  | {
      isBase: true
      baseBranch?: never
    }
)

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, branch, anchor, isBase = false, baseBranch } = props
  const stopAtAnchor = !isBase

  const historyQuery = useQueryCommitHistory(branch.name)
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(historyQuery, items)

  const divergence = useRemoteDivergence(branch)

  if (stopAtAnchor && anchor === null) {
    return
  }

  if (!historyQuery.data?.pages) {
    return
  }

  return items.map((virtualRow) => {
    if (anchor && stopAtAnchor && virtualRow.index > anchor.distance) {
      return undefined
    }

    const commit =
      anchor && virtualRow.index === anchor.distance
        ? anchor.hash
        : getPaginatedItem(
            historyQuery.data,
            virtualRow.index,
            HISTORY_PAGE_SIZE,
          )?.hash

    if (!commit) {
      return undefined
    }

    const isAnchor = anchor && commit === anchor.hash

    const parentCommit =
      getNextPaginatedItem(
        historyQuery.data,
        virtualRow.index,
        HISTORY_PAGE_SIZE,
      )?.hash ??
      (anchor && anchor.distance > virtualRow.index ? anchor.hash : undefined)
    const parentIsDistantAnchor =
      anchor &&
      anchor.hash === parentCommit &&
      anchor.distance > virtualRow.index + 1

    const isUnconfirmed =
      divergence && ancestorIsDivergent(virtualRow.index, divergence)

    return (
      <GraphCommit
        key={commit}
        commitId={commit}
        commitType={isUnconfirmed ? 'unconfirmed' : 'confirmed'}
        elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
        parent={mapFn(parentCommit, (parentCommit) => ({
          id: COMMIT_ELEMENT_ID(
            parentCommit,
            isAnchor && !!baseBranch ? baseBranch.name : branch.name,
          ),
          type: parentIsDistantAnchor
            ? 'dashed'
            : isUnconfirmed
              ? 'unconfirmed'
              : 'solid',
        }))}
        distance={virtualRow.index}
        className={cn('absolute top-0', isBase ? 'left-[55%]' : 'left-[3%]')}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
