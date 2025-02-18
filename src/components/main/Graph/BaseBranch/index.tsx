import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { BranchInfo, CommitId, CommonAncestorInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, getPaginatedItem } from '@api/utils'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import { ancestorNotInRange, useInfiniteScroll } from '../utils'

interface GraphBaseBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchInfo
  ancestorInfo: CommonAncestorInfo | undefined
}

const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { virtualizer, path, branch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch.name))

  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(history, items)

  const displayExtraAncestor =
    ancestorInfo &&
    ancestorNotInRange(ancestorInfo.commonCommit.distance, history, items)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          const commit: CommitId | undefined = getPaginatedItem(
            history,
            virtualRow.index,
          )?.hash

          const nextIsCommon =
            ancestorInfo &&
            virtualRow.index + 1 === ancestorInfo.commonCommit.distance

          const parentCommit: CommitId | undefined =
            getNextPaginatedItem(history, virtualRow.index)?.hash ??
            (ancestorInfo &&
            ancestorInfo.commonCommit.distance > virtualRow.index
              ? ancestorInfo.commonCommit.hash
              : undefined)

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              commitType="confirmed"
              elementId={COMMIT_ELEMENT_ID(commit, branch.name)}
              parent={
                parentCommit
                  ? {
                      id: COMMIT_ELEMENT_ID(parentCommit, branch.name),
                      type:
                        displayExtraAncestor &&
                        parentCommit === ancestorInfo.commonCommit.hash &&
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
          key={ancestorInfo.commonCommit.distance}
          path={path}
          commitId={ancestorInfo.commonCommit.hash}
          commitType="confirmed"
          elementId={COMMIT_ELEMENT_ID(
            ancestorInfo.commonCommit.hash,
            branch.name,
          )}
          parent={undefined}
          className={clsx('absolute top-0 left-[60%]')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.commonCommit.distance)) * ancestorInfo.commonCommit.distance}px)`,
          }}
        />
      )}
    </>
  )
}

export { GraphBaseBranch, type GraphBaseBranchProps }
