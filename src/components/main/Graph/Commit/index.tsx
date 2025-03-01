import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { match } from 'ts-pattern'

import type { BranchName, CommitId } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { Hovercard, HovercardDisclosure } from '@lib/Hovercard'
import { makeTracked } from '@main/SvgOverlay'
import { GraphCommitInfo } from '../CommitInfo'
import type { ParentCommitType } from '../Edges'

export type CommitType = 'confirmed' | 'unconfirmed'

export const NODE_SIZE = 20
export const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphCommitProps extends ComponentProps<'div'> {
  commitId: CommitId
  commitType: CommitType
}

const GraphCommit = makeTracked<
  GraphCommitProps,
  HTMLDivElement,
  ParentCommitType
>((props) => {
  const { commitId, commitType, trackRef, ...divProps } = props
  const commitInfo = useRepositoryQuery(commitInfoQuery, commitId)

  return (
    <Hovercard
      className={clsx('p-4')}
      placement="right"
      anchor={
        <div
          {...divProps}
          ref={mergeRefs([trackRef, divProps.ref])}
          className={clsx(
            'flex flex-row items-center gap-5',
            'cursor-pointer',
            divProps.className,
          )}
        >
          <div
            className={clsx(
              'rounded-full shadow-md',
              match(commitType)
                .with('confirmed', () => 'bg-primary-600')
                .with('unconfirmed', () => 'bg-accent-400')
                .exhaustive(),
            )}
            style={{ width: NODE_SIZE, height: NODE_SIZE }}
          />
          <div className={clsx('flex flex-row gap-1 items-center')}>
            <p className={clsx('text-xs')}>
              {commitInfo.data?.shortHash ?? '...'}
            </p>
            <HovercardDisclosure />
          </div>
        </div>
      }
      description={
        commitInfo.data ? (
          <GraphCommitInfo commitInfo={commitInfo.data} />
        ) : (
          <p className={clsx('text-xs text-light-800')}>...</p>
        )
      }
    />
  )
})

export { GraphCommit, type GraphCommitProps }
