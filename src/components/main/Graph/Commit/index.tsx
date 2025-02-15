import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import type { HTMLProps } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Tooltip } from '@lib/Tooltip'
import { makeTracked } from '@main/SvgOverlay'
import { match } from 'ts-pattern'
import { GraphCommitInfo } from '../CommitInfo'
import type { ParentCommitType } from '../Edges'

export type CommitType = 'confirmed' | 'unconfirmed'

export const NODE_SIZE = 20
export const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphCommitProps extends HTMLProps<HTMLDivElement> {
  path: string
  commitId: CommitId
  commitType: CommitType
}

const GraphCommit = makeTracked<
  GraphCommitProps,
  HTMLDivElement,
  ParentCommitType
>((props) => {
  const { path, commitId, commitType, trackRef, ...divProps } = props
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
          className={clsx(
            'rounded-full shadow-md',
            match(commitType)
              .with('confirmed', () => 'bg-primary')
              .with('unconfirmed', () => 'bg-accent')
              .exhaustive(),
          )}
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
