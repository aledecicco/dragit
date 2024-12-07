import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { ArcherElement } from 'react-archer'

import type { BranchName, CommitId, CommitInfo } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'

export const COMMIT_ID = (ref: CommitId, branch: BranchName) =>
  `commit_${branch}_${ref}`

type GraphCommitProps = {
  path: string
  branch: BranchName
  reference: CommitId
  parent?: string
}

const GraphCommit = (props: GraphCommitProps) => {
  const { path, branch, reference, parent } = props
  const commitInfo = useQuery(commitInfoQuery(path, reference))

  return (
    <Tooltip content={<GraphCommitInfo commitInfo={commitInfo.data} />}>
      <div
        className={clsx('flex flex-row items-center p-2 gap-5 cursor-pointer')}
      >
        <ArcherElement
          id={COMMIT_ID(reference, branch)}
          relations={
            parent
              ? [
                  {
                    targetId: parent,
                    targetAnchor: 'top',
                    sourceAnchor: 'bottom',
                  },
                ]
              : undefined
          }
        >
          <div className={clsx('bg-primary rounded-full w-7 h-7 shadow-md')} />
        </ArcherElement>
        <div>
          <p className={clsx('text-xs')}>
            {commitInfo.data?.shortHash ?? '...'}
          </p>
          <p className={clsx('text-xs')}>{parent ?? '...'}</p>
        </div>
      </div>
    </Tooltip>
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
