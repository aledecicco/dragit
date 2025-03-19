import type { Virtualizer } from '@tanstack/react-virtual'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  useRepositoryInfiniteQuery,
} from '@api/utils'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  getCommitPositionClass,
  getCommitTranslationY,
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

  const history = useRepositoryInfiniteQuery(commitHistoryQuery, branch.name)
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const divergence = useRemoteDivergence(branch)

  if (stopAtAnchor && anchor === null) {
    return
  }

  if (!history.data?.pages) {
    return
  }

  return items.map((virtualRow) => {
    if (anchor && stopAtAnchor && virtualRow.index > anchor.distance) {
      return undefined
    }

    const commit =
      anchor && virtualRow.index === anchor.distance
        ? anchor.hash
        : getPaginatedItem(history.data, virtualRow.index)?.hash

    if (!commit) {
      return undefined
    }

    const isAnchor = anchor && commit === anchor.hash

    const parentCommit =
      getNextPaginatedItem(history.data, virtualRow.index)?.hash ??
      (anchor && anchor.distance > virtualRow.index ? anchor.hash : undefined)
    const parentIsDistantAnchor =
      anchor &&
      anchor.hash === parentCommit &&
      anchor.distance > virtualRow.index + 1

    const isUnconfirmed =
      divergence && ancestorIsDivergent(virtualRow.index, divergence)

    return (
      <GraphCommit
        key={virtualRow.key}
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
        className={cn('absolute top-0', getCommitPositionClass(isBase))}
        style={{
          transform: `translateY(${getCommitTranslationY(virtualizer, virtualRow.index)}px)`,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
