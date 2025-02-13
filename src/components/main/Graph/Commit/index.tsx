import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import type { HTMLProps } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'
import { makeTracked } from '@main/SvgOverlay'
import { GraphCommitInfo } from '../CommitInfo'
import type { ParentCommitType } from '../Edges'

export const NODE_SIZE = 20
export const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphCommitProps extends HTMLProps<HTMLDivElement> {
  path: string
  commitId: CommitId
}

const GraphCommit = makeTracked<
  GraphCommitProps,
  HTMLDivElement,
  ParentCommitType
>((props) => {
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
})

export { GraphCommit, type GraphCommitProps }
