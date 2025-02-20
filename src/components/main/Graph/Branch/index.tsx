import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  getCommitPositionClass,
  getCommitTranslationY,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'
import { BranchMessage } from './Message'

interface GraphBranchProps {
  path: string
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  anchor: AncestorInfo | undefined | null
  isBase: boolean
}

const GraphBranch = (props: GraphBranchProps) => {
  const { path, virtualizer, branch, anchor, isBase } = props
  const stopAtAnchor = !isBase

  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const divergence = useRemoteDivergence(path, branch)

  if (stopAtAnchor && (anchor === null || anchor?.distance === 0)) {
    return <BranchMessage isBase={isBase}>No new commits</BranchMessage>
  }

  if (!history.data) {
    return (
      <BranchMessage isBase={isBase}>
        {history.isFetching ? 'Loading branch history...' : 'No commits found'}
      </BranchMessage>
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
        className={clsx('absolute top-0', getCommitPositionClass(isBase))}
        style={{
          transform: `translateY(${getCommitTranslationY(virtualizer, virtualRow.index)}px)`,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
