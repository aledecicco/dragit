import clsx from 'clsx'

import type { CommitInfo } from '@api/models'

interface GraphCommitInfoProps {
  commitInfo: CommitInfo | undefined
}

const GraphCommitInfo = (props: GraphCommitInfoProps) => {
  const { commitInfo } = props

  return (
    <div className={clsx('flex flex-col gap-4')}>
      {commitInfo ? (
        <>
          <div>
            <p className={clsx('text-xs text-light-400')}>
              {commitInfo.authorName} - {commitInfo.authorEmail}
            </p>
            <p className={clsx('text-xs text-light-400')}>
              {new Date(commitInfo.timestamp).toDateString()}
            </p>
          </div>
          <p className={clsx('text-sm')}>{commitInfo.message}</p>
          <p className={clsx('text-xs text-primary-300')}>{commitInfo.hash}</p>
        </>
      ) : (
        <p className={clsx('text-xs text-light-400')}>...</p>
      )}
    </div>
  )
}

export { GraphCommitInfo, type GraphCommitInfoProps }
