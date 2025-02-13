import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchName, CommitId } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  getPaginatedLength,
} from '@api/utils'
import { useCallback } from 'react'
import { GraphCommit } from '../Commit'
import { DASHED_PARENT, SOLID_PARENT } from '../Edges'
import { ancestorNotInRange, useInfiniteScroll } from '../utils'

const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchName
  baseBranch: BranchName | undefined
  ancestorInfo: AncestorInfo | undefined
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, baseBranch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  const items = virtualizer.getVirtualItems()
  const shouldFetch = useCallback(() => {
    return (
      !ancestorInfo ||
      getPaginatedLength(history) <= ancestorInfo.branchDistance
    )
  }, [history, ancestorInfo])
  useInfiniteScroll(history, items, shouldFetch)

  const displayExtraAncestor =
    ancestorInfo?.lastCommit &&
    baseBranch &&
    ancestorNotInRange(ancestorInfo.branchDistance, history, items)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          if (ancestorInfo && virtualRow.index > ancestorInfo.branchDistance) {
            return
          }

          const commit: CommitId | undefined = getPaginatedItem(
            history,
            virtualRow.index,
          )?.hash

          const isLast =
            ancestorInfo && virtualRow.index === ancestorInfo.branchDistance
          const nextIsLast =
            ancestorInfo && virtualRow.index + 1 === ancestorInfo.branchDistance

          const parentCommit: CommitId | undefined = isLast
            ? ancestorInfo.commonCommit
            : (getNextPaginatedItem(history, virtualRow.index)?.hash ??
              ancestorInfo?.lastCommit)

          const parentBranch: BranchName | undefined = parentCommit
            ? ancestorInfo && parentCommit === ancestorInfo.commonCommit
              ? baseBranch
              : branch
            : undefined

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch)}
              parent={
                parentCommit && parentBranch
                  ? {
                      id: COMMIT_ELEMENT_ID(parentCommit, parentBranch),
                      type:
                        displayExtraAncestor &&
                        parentCommit === ancestorInfo.lastCommit &&
                        !nextIsLast
                          ? DASHED_PARENT
                          : SOLID_PARENT,
                    }
                  : undefined
              }
              className={clsx('absolute top-0 left-[8%]')}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ) : undefined
        })
      ) : (
        <p>
          {history.isFetching
            ? 'Loading branch history...'
            : 'No commits found'}
        </p>
      )}

      {displayExtraAncestor && ancestorInfo.lastCommit && baseBranch && (
        <GraphCommit
          key={ancestorInfo.branchDistance}
          path={path}
          commitId={ancestorInfo.lastCommit}
          elementId={COMMIT_ELEMENT_ID(ancestorInfo.lastCommit, branch)}
          parent={{
            id: COMMIT_ELEMENT_ID(ancestorInfo.commonCommit, baseBranch),
            type: SOLID_PARENT,
          }}
          className={clsx('absolute top-0 left-[8%]')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.branchDistance)) * ancestorInfo.branchDistance}px)`,
          }}
        />
      )}
    </>
  )
}

export { GraphBranch, type GraphBranchProps }
