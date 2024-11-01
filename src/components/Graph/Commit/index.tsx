import type { CommitInfo } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { useQuery } from '@tanstack/react-query'

type GraphCommitProps = {
  path: string
  reference: string
}

const GraphCommit = (props: GraphCommitProps) => {
  const { path, reference } = props
  const commitInfo = useQuery(commitInfoQuery(path, reference))

  return (
    <div>
      {reference}
      {commitInfo.data ? (
        <GraphCommitInfo commitInfo={commitInfo.data} />
      ) : (
        <p>
          {commitInfo.isFetching
            ? 'Loading commit info...'
            : 'No commit info found'}
        </p>
      )}
    </div>
  )
}

const GraphCommitInfo = (props: { commitInfo: CommitInfo }) => {
  const { commitInfo } = props
  console.log(commitInfo)

  return (
    <div>
      <p>
        {commitInfo.authorName} - {commitInfo.authorEmail}
      </p>
      <p>{new Date(commitInfo.timestamp).toDateString()}</p>
      <p>{commitInfo.message}</p>
    </div>
  )
}

export { GraphCommit, type GraphCommitProps }
