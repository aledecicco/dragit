import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useMemo } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { PAGE_SIZE, commitHistoryQuery } from '@api/queries'
import { Button } from '@lib/Button'
import { last, range } from '@utils/array'
import { GraphCommit } from '../Commit'

interface GraphBranchProps {
  path: string
  branch: BranchName
  stopAt?: { branch: BranchName; commit: CommitId }
}

const GraphBranch = (props: GraphBranchProps) => {
  const { path, branch, stopAt } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  const pagination = useMemo(() => {
    if (history.data?.pages) {
      for (let i = 0; i < history.data.pages.length; i++) {
        for (let j = 0; j < history.data.pages[i].length; j++) {
          if (history.data.pages[i][j] === stopAt?.commit) {
            return {
              lastPageIndex: i,
              pageIndexes: range(i + 1),
              commitIndexes: range(PAGE_SIZE),
              lastCommitIndexes: range(j),
              stopped: true,
            }
          }
        }
      }

      return {
        lastPageIndex: history.data.pages.length - 1,
        pageIndexes: range(history.data.pages.length),
        commitIndexes: range(PAGE_SIZE),
        lastCommitIndexes: range(last(history.data.pages).length),
        stopped: false,
      }
    }

    return {
      lastPageIndex: undefined,
      pageIndexes: [],
      commitIndexes: [],
      lastCommitIndexes: [],
      stopped: false,
    }
  }, [history.data?.pages, stopAt])

  return (
    <div className={clsx('flex flex-col gap-12 p-6')}>
      {history.data ? (
        pagination.pageIndexes.map((pageIndex) =>
          (pageIndex === pagination.lastPageIndex
            ? pagination.lastCommitIndexes
            : pagination.commitIndexes
          ).map((commitIndex) => {
            const commit: CommitId = history.data.pages[pageIndex][commitIndex]
            const nextCommit: CommitId | undefined =
              history.data.pages[pageIndex][commitIndex + 1] ??
              history.data.pages[pageIndex + 1]?.[0]

            const nextBranch = nextCommit
              ? stopAt && nextCommit === stopAt.commit
                ? stopAt.branch
                : branch
              : undefined

            return (
              <GraphCommit
                key={commit}
                path={path}
                commitId={commit}
                branch={branch}
                parentCommitId={nextCommit}
                parentBranch={nextBranch}
              />
            )
          }),
        )
      ) : (
        <p>
          {history.isFetching
            ? 'Loading branch history...'
            : 'No commits found'}
        </p>
      )}
      {!pagination.stopped && history.hasNextPage && (
        <Button
          type="button"
          variant="neutral"
          className={clsx('self-center')}
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
    </div>
  )
}

export { GraphBranch, type GraphBranchProps }
