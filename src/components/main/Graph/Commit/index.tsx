import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import type { HTMLProps } from 'react'

import type { BranchName, CommitId, CommitInfo } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'
import { makeTracked } from '@main/SvgOverlay'
import type { TrackRefProps } from '@main/SvgOverlay/utils'

export const NODE_SIZE = 20
export const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphCommitProps extends HTMLProps<HTMLDivElement> {
  path: string
  commitId: CommitId
}

const GraphCommit = makeTracked(
  (props: GraphCommitProps & TrackRefProps<HTMLDivElement>) => {
    const { path, commitId, trackRef, ...divProps } = props
    const commitInfo = useQuery(commitInfoQuery(path, commitId))

    return (
      <Tooltip content={<GraphCommitInfo commitInfo={commitInfo.data} />}>
        <div
          {...divProps}
          ref={trackRef}
          className={clsx(
            'flex flex-row items-center gap-5 cursor-pointer',
            divProps.className,
          )}
        >
          <div
            className={clsx('bg-primary rounded-full shadow-md')}
            style={{ width: NODE_SIZE, height: NODE_SIZE }}
          />
          <div>
            <p className={clsx('text-xs')}>
              {commitInfo.data?.shortHash ?? '...'}
            </p>
          </div>
        </div>
      </Tooltip>
    )
  },
)

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
          <p className={clsx('text-xs text-primary-500 dark:text-primary-300')}>
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
