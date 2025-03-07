import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  useRepositoryInfiniteQuery,
} from '@api/utils'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  getCommitPositionClass,
  getCommitTranslationY,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  anchor: AncestorInfo | undefined | null
  isBase: boolean
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, branch, anchor, isBase } = props
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
    if (anchor) {
      if (stopAtAnchor && virtualRow.index > anchor.distance) {
        return undefined
      }

      if (virtualRow.index === anchor.distance) {
        return undefined
      }
    }

    const commit = getPaginatedItem(history.data, virtualRow.index)?.hash
    if (!commit) {
      return undefined
    }

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
        key={virtualRow.index}
        commitId={commit}
        commitType={isUnconfirmed ? 'unconfirmed' : 'confirmed'}
        elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
        parent={mapFn(parentCommit, (parentCommit) => ({
          id: COMMIT_ELEMENT_ID(parentCommit, branch.name),
          type: parentIsDistantAnchor
            ? 'dashed'
            : isUnconfirmed
              ? 'unconfirmed'
              : 'solid',
        }))}
        className={clsx('absolute top-0', getCommitPositionClass(isBase))}
        style={{
          transform: `translateY(${getCommitTranslationY(virtualizer, virtualRow.index)}px)`,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
