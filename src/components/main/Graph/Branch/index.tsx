import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import clsx from 'clsx'

import type { BranchName, CommitId } from '@api/models'
import { PAGE_SIZE, commitHistoryQuery } from '@api/queries'
import { Button } from '@lib/Button'
import type { Virtualizer } from '@tanstack/react-virtual'
import { GraphCommit } from '../Commit'

const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchName
  isBase?: boolean // ToDo: tidier?
  stopAt?: { branch: BranchName; commit: CommitId }
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, isBase, stopAt } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  return (
    <>
      {history.data ? (
        virtualizer.getVirtualItems().map((virtualRow) => {
          const pageIndex = Math.floor(virtualRow.index / PAGE_SIZE)
          const itemIndex = virtualRow.index % PAGE_SIZE

          const commit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex]
          const nextCommit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex + 1] ??
            history.data.pages[pageIndex + 1]?.[0]
          const nextBranch: BranchName | undefined = nextCommit
            ? stopAt && nextCommit === stopAt.commit
              ? stopAt.branch
              : branch
            : undefined

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch)}
              parentId={
                nextCommit && nextBranch
                  ? COMMIT_ELEMENT_ID(nextCommit, nextBranch)
                  : undefined
              }
              className={clsx(
                'absolute top-0',
                isBase ? 'left-half' : 'left-0',
              )}
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

      {history.hasNextPage && (
        <Button
          type="button"
          variant="neutral"
          className={clsx(
            'absolute top-full translate-full',
            isBase ? 'left-half' : 'left-0',
          )}
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

export { GraphBranch, type GraphBranchProps }
