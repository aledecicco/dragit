import { useQuery } from '@tanstack/react-query'

import type { CommitId, CommitInfo } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'
import clsx from 'clsx'

const COMMIT_ID = (ref: CommitId) => `commit_${ref}`

type GraphCommitProps = {
  path: string
  reference: string
}

const GraphCommit = (props: GraphCommitProps) => {
  const { path, reference } = props
  const commitInfo = useQuery(commitInfoQuery(path, reference))

  return (
    <div className={clsx('flex flex-row items-center gap-5')}>
      <Tooltip content={<GraphCommitInfo commitInfo={commitInfo.data} />}>
        <div
          className={clsx('bg-primary rounded-full w-7 h-7')}
          id={COMMIT_ID(reference)}
        />
      </Tooltip>
      <p className={clsx('text-xs')}>{commitInfo.data?.shortHash ?? '...'}</p>
    </div>
  )
}

const GraphCommitInfo = (props: { commitInfo?: CommitInfo }) => {
  const { commitInfo } = props

  return (
    <div className={clsx('flex flex-col gap-4')}>
      {commitInfo ? (
        <>
          <div>
            <p className={clsx('text-xs text-dark-600 dark:text-light-400')}>
              {commitInfo.authorName} - {commitInfo.authorEmail}
            </p>
            <p className={clsx('text-xs text-dark-600 dark:text-light-400')}>
              {new Date(commitInfo.timestamp).toDateString()}
            </p>
          </div>
          <p className={clsx('text-sm')}>{commitInfo.message}</p>
          <p className={clsx('text-xs text-accent-500 dark:text-accent-300')}>
            {commitInfo.hash}
          </p>
        </>
      ) : (
        <p className={clsx('text-xs text-dark-600 dark:text-light-400')}>...</p>
      )}
    </div>
  )
}

export { GraphCommit, type GraphCommitProps }
