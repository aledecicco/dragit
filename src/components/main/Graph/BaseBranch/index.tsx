import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { AncestorInfo, BranchName, CommitId } from '@api/models'
import { PAGE_SIZE, commitHistoryQuery } from '@api/queries'
import { Button } from '@lib/Button'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'

interface GraphBaseBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchName
  ancestorInfo: AncestorInfo | undefined
}

const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { virtualizer, path, branch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  const items = virtualizer.getVirtualItems()
  const ancestorNotInRange =
    ancestorInfo &&
    !items.find((virtualRow) => virtualRow.index === ancestorInfo.baseDistance)

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          const pageIndex = Math.floor(virtualRow.index / PAGE_SIZE)
          const itemIndex = virtualRow.index % PAGE_SIZE

          const commit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex]
          const nextCommit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex + 1] ??
            history.data.pages[pageIndex + 1]?.[0]

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch)}
              parentId={
                nextCommit ? COMMIT_ELEMENT_ID(nextCommit, branch) : undefined
              }
              className={clsx('absolute top-0 left-half')}
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

      {ancestorNotInRange && (
        <GraphCommit
          key={ancestorInfo.baseDistance}
          path={path}
          commitId={ancestorInfo.commonCommit}
          elementId={COMMIT_ELEMENT_ID(ancestorInfo.commonCommit, branch)}
          parentId={undefined}
          className={clsx('absolute top-0 left-half')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.baseDistance)) * ancestorInfo.baseDistance}px)`,
          }}
        />
      )}

      {history.hasNextPage && (
        <Button
          type="button"
          variant="neutral"
          className={clsx('absolute top-full translate-full left-half')}
          rounded
          aria-label="Load more commits for this branch"
          disabled={history.isFetchingNextPage || !history.hasNextPage}
          onClick={() => {
            history.fetchNextPage()
          }}
        >
          <PlusIcon />
        </Button>
      )}
    </>
  )
}

export { GraphBaseBranch, type GraphBaseBranchProps }
