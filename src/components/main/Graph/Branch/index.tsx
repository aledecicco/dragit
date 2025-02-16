import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useCallback } from 'react'

import type {
  AncestorInfo,
  BranchInfo,
  BranchName,
  CommitId,
} from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import {
  getNextPaginatedItem,
  getPaginatedItem,
  getPaginatedLength,
} from '@api/utils'
import { GraphCommit } from '../Commit'
import {
  ancestorNotInRange,
  useInfiniteScroll,
  useRemoteDivergence,
} from '../utils'

const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchInfo
  baseBranch: BranchInfo | undefined
  ancestorInfo: AncestorInfo | undefined
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, baseBranch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))

  const items = virtualizer.getVirtualItems()
  const shouldFetch = useCallback(() => {
    return (
      !ancestorInfo?.lastCommit ||
      getPaginatedLength(history) <= ancestorInfo.lastCommit.branchDistance
    )
  }, [history, ancestorInfo])
  useInfiniteScroll(history, items, shouldFetch)

  const displayExtraAncestor =
    ancestorInfo?.lastCommit &&
    baseBranch &&
    ancestorNotInRange(ancestorInfo.lastCommit.branchDistance, history, items)

  const divergence = useRemoteDivergence(path, branch)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          if (
            ancestorInfo?.lastCommit &&
            virtualRow.index > ancestorInfo.lastCommit.branchDistance
          ) {
            return
          }

          const commit: CommitId | undefined = getPaginatedItem(
            history,
            virtualRow.index,
          )?.hash

          const isLast =
            ancestorInfo?.lastCommit &&
            virtualRow.index === ancestorInfo.lastCommit.branchDistance
          const nextIsLast =
            ancestorInfo?.lastCommit &&
            virtualRow.index + 1 === ancestorInfo.lastCommit.branchDistance

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
          key={ancestorInfo.lastCommit.branchDistance}
          path={path}
          commitId={ancestorInfo.lastCommit.hash}
          commitType={
            divergence &&
            ancestorInfo.lastCommit.branchDistance + 1 <= divergence.ahead
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
              ancestorInfo.lastCommit.branchDistance + 1 <= divergence.ahead
                ? 'unconfirmed'
                : 'solid',
          }}
          className={clsx('absolute top-0 left-[8%]')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.lastCommit.branchDistance)) * ancestorInfo.lastCommit.branchDistance}px)`,
          }}
        />
      )}
    </>
  )
}

export { GraphBranch, type GraphBranchProps }
