import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { BranchName, CommitId } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { Popover } from '@lib/Popover'
import { makeTracked } from '@main/SvgOverlay'
import { GraphCommitInfo } from '../CommitInfo'
import type { ParentCommitType } from '../Edges'

export type CommitType = 'confirmed' | 'unconfirmed'

export const NODE_SIZE = 20
export const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphCommitProps extends ComponentProps<'div'> {
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
    <div
      {...divProps}
      ref={trackRef}
      className={clsx('cursor-pointer', divProps.className)}
    >
      <Popover
        placement="right"
        anchor={
          <div className={clsx('flex flex-row items-center gap-5')}>
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
        }
        description={<GraphCommitInfo commitInfo={commitInfo.data} />}
      />
    </div>
  )
})

export { GraphCommit, type GraphCommitProps }
