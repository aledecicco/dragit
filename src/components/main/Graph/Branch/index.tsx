import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import {
  COMMIT_ELEMENT_ID,
  GraphCommit,
  type GraphCommitProps,
} from '../Commit'
import {
  ancestorIsDivergent,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

interface GraphBranchProps {
  path: string
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  anchor: AncestorInfo | undefined
  stopAtAnchor: boolean
  commitProps?: Partial<GraphCommitProps>
}

const GraphBranch = (props: GraphBranchProps) => {
  const { path, virtualizer, branch, anchor, stopAtAnchor, commitProps } = props

  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const divergence = useRemoteDivergence(path, branch)

  if (stopAtAnchor && anchor && anchor.distance === 0) {
    return <p>No new commits</p>
  }

  if (!history.data) {
    return (
      <p>
        {history.isFetching ? 'Loading branch history...' : 'No commits found'}
      </p>
    )
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

    const commit = getPaginatedItem(history, virtualRow.index)?.hash
    if (!commit) {
      return undefined
    }

    const parentCommit =
      getNextPaginatedItem(history, virtualRow.index)?.hash ??
      (anchor && anchor.distance > virtualRow.index ? anchor.hash : undefined)
    const parentIsDistantAnchor =
      anchor &&
      anchor.hash === parentCommit &&
      anchor.distance > virtualRow.index + 1

    const isUnconfirmed =
      divergence && ancestorIsDivergent(virtualRow.index, divergence)

    return commit ? (
      <GraphCommit
        key={virtualRow.index}
        path={path}
        commitId={commit}
        commitType={isUnconfirmed ? 'unconfirmed' : 'confirmed'}
        elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
        parent={
          parentCommit
            ? {
                id: COMMIT_ELEMENT_ID(parentCommit, branch.name),
                type: parentIsDistantAnchor
                  ? 'dashed'
                  : isUnconfirmed
                    ? 'unconfirmed'
                    : 'solid',
              }
            : undefined
        }
        {...commitProps}
        className={clsx('absolute top-0', commitProps?.className)}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
          ...commitProps?.style,
        }}
      />
    ) : undefined
  })
}

export { GraphBranch, type GraphBranchProps }
