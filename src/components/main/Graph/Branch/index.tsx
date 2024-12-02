import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useMemo } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { commitHistoryQuery, headInfoQuery } from '@api/queries'
import { Button } from '@lib/Button'
import { range } from '@utils/array'
import { GraphCommit } from '../Commit'

interface GraphBranchProps {
  path: string
  branch: BranchName
  stopAt?: CommitId
}

const GraphBranch = (props: GraphBranchProps) => {
  const { path, branch, stopAt } = props
  const headInfo = useQuery(headInfoQuery(path))
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  const pagination = useMemo(() => {
    if (history.data) {
      for (let i = 0; i < history.data.pages.length; i++) {
        for (let j = 0; j < history.data.pages[i].length; j++) {
          if (history.data.pages[i][j] === stopAt) {
            return {
              lastPageIndex: i,
              pageIndexes: range(i + 1),
              commitIndexes: range(history.data.pages[0].length),
              lastCommitIndexes: range(j),
              stopped: true,
            }
          }
        }
      }

      return {
        lastPageIndex: undefined,
        pageIndexes: range(history.data.pages.length),
        commitIndexes: range(history.data.pages[0].length),
        lastCommitIndexes: [],
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
  }, [history.data, stopAt])

  return (
    <div className={clsx('flex flex-col gap-9 p-6')}>
      {history.data ? (
        pagination.pageIndexes.map((pageIndex) =>
          (pageIndex === pagination.lastPageIndex
            ? pagination.lastCommitIndexes
            : pagination.commitIndexes
          ).map((commitIndex) => (
            <GraphCommit
              key={history.data.pages[pageIndex][commitIndex]}
              path={path}
              reference={history.data.pages[pageIndex][commitIndex]}
            />
          )),
        )
      ) : (
        <p>
          {history.isFetching
            ? 'Loading branch history...'
            : 'No commits found'}
        </p>
      )}
      {!pagination.stopped && (
        <Button
          type="button"
          variant="neutral"
          className={clsx('w-max h-max')}
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
