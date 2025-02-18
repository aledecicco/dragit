import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useCallback } from 'react'

import type { BranchInfo, CommitId, CommonAncestorInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  getPaginatedLength,
} from '@api/utils'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorNotInRange,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchInfo
  baseBranch: BranchInfo | undefined
  ancestorInfo: CommonAncestorInfo | undefined
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, baseBranch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))

  const items = virtualizer.getVirtualItems()
  const shouldFetch = useCallback(() => {
    return (
      !ancestorInfo?.lastCommit ||
      getPaginatedLength(history) <= ancestorInfo.lastCommit.distance
    )
  }, [history, ancestorInfo])
  useInfiniteScroll(history, items, shouldFetch)

  const displayExtraAncestor =
    ancestorInfo?.lastCommit &&
    baseBranch &&
    ancestorNotInRange(ancestorInfo.lastCommit.distance, history, items)

  const divergence = useRemoteDivergence(path, branch)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          if (
            ancestorInfo &&
            (ancestorInfo.lastCommit === null ||
              virtualRow.index > ancestorInfo.lastCommit.distance)
          ) {
            return
          }

          const commit: CommitId | undefined = getPaginatedItem(
            history,
            virtualRow.index,
          )?.hash

          const isLast =
            ancestorInfo?.lastCommit &&
            virtualRow.index === ancestorInfo.lastCommit.distance
          const nextIsLast =
            ancestorInfo?.lastCommit &&
            virtualRow.index + 1 === ancestorInfo.lastCommit.distance

          const parentCommit: CommitId | undefined = isLast
            ? ancestorInfo.commonCommit.hash
            : (getNextPaginatedItem(history, virtualRow.index)?.hash ??
              ancestorInfo?.lastCommit?.hash ??
              undefined)

          const parentBranch: BranchInfo | undefined = parentCommit
            ? ancestorInfo && parentCommit === ancestorInfo.commonCommit.hash
              ? baseBranch
              : branch
            : undefined

          const isUnconfirmed =
            divergence && virtualRow.index + 1 <= divergence.ahead

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              commitType={isUnconfirmed ? 'unconfirmed' : 'confirmed'}
              elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
              parent={
                parentCommit && parentBranch
                  ? {
                      id: COMMIT_ELEMENT_ID(parentCommit, parentBranch.name),
                      type:
                        displayExtraAncestor &&
                        parentCommit === ancestorInfo.lastCommit?.hash &&
                        !nextIsLast
                          ? 'dashed'
                          : isUnconfirmed
                            ? 'unconfirmed'
                            : 'solid',
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
          key={ancestorInfo.lastCommit.distance}
          path={path}
          commitId={ancestorInfo.lastCommit.hash}
          commitType={
            divergence &&
            ancestorInfo.lastCommit.distance + 1 <= divergence.ahead
              ? 'unconfirmed'
              : 'confirmed'
          }
          elementId={COMMIT_ELEMENT_ID(
            ancestorInfo.lastCommit.hash,
            branch.name,
          )}
          parent={{
            id: COMMIT_ELEMENT_ID(
              ancestorInfo.commonCommit.hash,
              baseBranch.name,
            ),
            type:
              divergence &&
              ancestorInfo.lastCommit.distance + 1 <= divergence.ahead
                ? 'unconfirmed'
                : 'solid',
          }}
          className={clsx('absolute top-0 left-[8%]')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.lastCommit.distance)) * ancestorInfo.lastCommit.distance}px)`,
          }}
        />
      )}
    </>
  )
}

export { GraphBranch, type GraphBranchProps }
