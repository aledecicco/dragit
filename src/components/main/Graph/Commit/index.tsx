import type { ComponentProps } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { match } from 'ts-pattern'

import type { BranchName, CommitId } from '@api/models'
import { commitInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { ProfilePicture, type ProfilePictureVariant } from '@lib/ProfilePicture'
import { makeTracked } from '@lib/SvgOverlay'
import { Marquee } from '@ui/Marquee'
import { cn, propsWithCn } from '@utils/styles'
import type { ParentCommitType } from '../Edges'

export type CommitType = 'confirmed' | 'unconfirmed'

export const NODE_SIZE = 26
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
    <div
      {...divProps}
      ref={mergeRefs([trackRef, divProps.ref])}
      {...propsWithCn(divProps, 'relative')}
    >
      <div
        className={cn(
          'rounded-full shadow-sm p-0.5',
          'flex items-center justify-center',
          match(commitType)
            .with('confirmed', () => 'bg-primary-600')
            .with('unconfirmed', () => 'bg-accent-400')
            .exhaustive(),
        )}
        style={{ width: NODE_SIZE, height: NODE_SIZE }}
      >
        <ProfilePicture
          username={commitInfo.data?.authorEmail}
          size="sm"
          variant={match(commitType)
            .returnType<ProfilePictureVariant>()
            .with('confirmed', () => 'primary')
            .with('unconfirmed', () => 'accent')
            .exhaustive()}
          className={cn('w-full h-full')}
        />
      </div>

      <div
        className={cn(
          'absolute left-full top-half translate-x-2 -translate-y-half w-80',
          'border-4 border-dark-600/85 rounded-sm shadow-md',
        )}
      >
        <div
          className={cn(
            'p-2 border-1 border-dark-100 rounded-sm',
            'bg-dark-700/75 dithered-dark-600',
            'flex flex-col gap-y-1',
          )}
        >
          <p
            className={cn('text-sm text-ellipsis text-nowrap overflow-hidden')}
          >
            {commitInfo.data?.message ?? '...'}
          </p>
          <div
            className={cn('flex flex-row items-center justify-between gap-x-1')}
          >
            <Marquee className={cn('text-xs text-light-950')}>
              {commitInfo.data?.authorName ?? '...'}
            </Marquee>

            <p className={cn('text-xs text-light-600 min-w-max')}>
              {commitInfo.data?.shortHash ?? '...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export { GraphCommit, type GraphCommitProps }
