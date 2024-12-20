import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { forwardRef } from 'react'

import type { CommitId, CommitInfo } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'
import { makeTracked } from '@main/SvgOverlay'

type GraphCommitProps = {
  path: string
  commitId: CommitId
}

const GraphCommit = makeTracked(
  forwardRef<HTMLDivElement, GraphCommitProps>((props, ref) => {
    const { path, commitId } = props
    const commitInfo = useQuery(commitInfoQuery(path, commitId))

    return (
      <Tooltip content={<GraphCommitInfo commitInfo={commitInfo.data} />}>
        <div
          className={clsx(
            'flex flex-row items-center p-2 gap-5 cursor-pointer',
          )}
        >
          <div
            className={clsx('bg-primary rounded-full w-5 h-5 shadow-md')}
            ref={ref}
          />
          <div>
            <p className={clsx('text-xs')}>
              {commitInfo.data?.shortHash ?? '...'}
            </p>
          </div>
        </div>
      </Tooltip>
    )
  }),
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
