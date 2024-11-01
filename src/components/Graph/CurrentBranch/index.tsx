import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { commitHistoryQuery, headInfoQuery } from '@api/queries'
import { GraphCommit } from '../Commit'

interface CurrentBranchProps {
  path: string
}

const CurrentBranch = (props: CurrentBranchProps) => {
  const { path } = props
  const headInfo = useQuery(headInfoQuery(path))

  return (
    <div>
      {headInfo.data?.status.type === 'branch' ? (
        <CurrentBranchGraph branch={headInfo.data.status.name} path={path} />
      ) : (
        <p>
          {headInfo.isFetching
            ? 'Loading current branch...'
            : 'No branch checked out'}
        </p>
      )}
    </div>
  )
}

const CurrentBranchGraph = (props: { branch: string } & CurrentBranchProps) => {
  const { branch, path } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  return (
    <div>
      <h4>{branch} *</h4>
      {history.data ? (
        history.data?.pages.map((page) =>
          page.map((commit) => (
            <GraphCommit key={commit} path={path} reference={commit} />
          )),
        )
      ) : (
        <p>
          {history.isFetching
            ? 'Loading branch history...'
            : 'No commits found'}
        </p>
      )}
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
    </div>
  )
}

export { CurrentBranch, type CurrentBranchProps }
