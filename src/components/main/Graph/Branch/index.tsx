import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import { mapFn } from '@utils/types'
import {
  COMMIT_ELEMENT_ID,
  GraphCommit,
  type GraphCommitProps,
} from '../Commit'
import {
  ancestorIsDivergent,
  getBranchPositionClass,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

interface GraphBranchProps {
  path: string
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  anchor: AncestorInfo | undefined | null
  stopAtAnchor: boolean
  commitProps?: Partial<GraphCommitProps>
}

const GraphBranch = (props: GraphBranchProps) => {
  const { path, virtualizer, branch, anchor, stopAtAnchor, commitProps } = props

  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const divergence = useRemoteDivergence(path, branch)

  if (stopAtAnchor && (anchor === null || anchor?.distance === 0)) {
    return (
      <p
        className={clsx(
          'absolute top-0 text-center w-[30%]',
          getBranchPositionClass(false),
        )}
      >
        No new commits
      </p>
    )
  }

  if (!history.data) {
    return (
      <p
        className={clsx(
          'absolute top-0 text-center w-[30%]',
          getBranchPositionClass(!stopAtAnchor),
        )}
      >
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

    return (
      <GraphCommit
        key={virtualRow.index}
        path={path}
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
        {...commitProps}
        className={clsx('absolute top-0', commitProps?.className)}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
          ...commitProps?.style,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
