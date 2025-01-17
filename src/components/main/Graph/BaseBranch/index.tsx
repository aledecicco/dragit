import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { BranchName, CommitId } from '@api/models'
import { PAGE_SIZE, commitHistoryQuery } from '@api/queries'
import { Button } from '@lib/Button'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'

interface GraphBaseBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchName
}

const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { virtualizer, path, branch } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  return (
    <>
      {history.data ? (
        virtualizer.getVirtualItems().map((virtualRow) => {
          const pageIndex = Math.floor(virtualRow?.index / PAGE_SIZE)
          const itemIndex = virtualRow?.index % PAGE_SIZE

          const commit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex]
          const nextCommit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex + 1] ??
            history.data.pages[pageIndex + 1]?.[0]

          return commit ? (
            <GraphCommit
              key={virtualRow?.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch)}
              parentId={
                nextCommit ? COMMIT_ELEMENT_ID(nextCommit, branch) : undefined
              }
              className={clsx('absolute top-0 left-half')}
              style={{
                transform: `translateY(${virtualRow?.start}px)`,
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
