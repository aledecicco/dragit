import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { commitHistoryQuery, headInfoQuery } from '@api/queries'
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
      for (let i = 0; i <= history.data.pages.length; i++) {
        for (let j = 0; j <= history.data.pages[i].length; j++) {
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
    <div>
      <h4>
        {branch}
        {headInfo.data?.status.type === 'branch' &&
          headInfo.data.status.name === branch &&
          ' *'}
      </h4>
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
        <button
          type="button"
          aria-label="Load more commits for this branch"
          disabled={history.isFetchingNextPage || !history.hasNextPage}
          onClick={() => {
            history.fetchNextPage()
          }}
        >
          {history.isFetchingNextPage ? 'Loading more...' : 'Load more'}
        </button>
      )}
    </div>
  )
}

export { GraphBranch, type GraphBranchProps }
