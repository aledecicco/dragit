import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchInfo, CommitId } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import { ancestorNotInRange, useInfiniteScroll } from '../utils'

interface GraphBaseBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchInfo
  ancestorInfo: AncestorInfo | undefined
}

const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { virtualizer, path, branch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))

  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const displayExtraAncestor =
    ancestorInfo &&
    ancestorNotInRange(ancestorInfo.baseDistance, history, items)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          const commit: CommitId | undefined = getPaginatedItem(
            history,
            virtualRow.index,
          )?.hash

          const nextIsCommon =
            ancestorInfo && virtualRow.index + 1 === ancestorInfo.baseDistance

          const parentCommit: CommitId | undefined =
            getNextPaginatedItem(history, virtualRow.index)?.hash ??
            (ancestorInfo && ancestorInfo.baseDistance > virtualRow.index
              ? ancestorInfo.commonCommit
              : undefined)

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
              parent={
                parentCommit
                  ? {
                      id: COMMIT_ELEMENT_ID(parentCommit, branch.name),
                      type:
                        displayExtraAncestor &&
                        parentCommit === ancestorInfo.commonCommit &&
                        !nextIsCommon
                          ? 'dashed'
                          : 'solid',
                    }
                  : undefined
              }
              className={clsx('absolute top-0 left-[60%]')}
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

      {displayExtraAncestor && (
        <GraphCommit
          key={ancestorInfo.baseDistance}
          path={path}
          commitId={ancestorInfo.commonCommit}
          elementId={COMMIT_ELEMENT_ID(ancestorInfo.commonCommit, branch.name)}
          parent={undefined}
          className={clsx('absolute top-0 left-[60%]')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.baseDistance)) * ancestorInfo.baseDistance}px)`,
          }}
        />
      )}
    </>
  )
}

export { GraphBaseBranch, type GraphBaseBranchProps }
