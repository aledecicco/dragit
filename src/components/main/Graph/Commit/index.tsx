import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { match } from 'ts-pattern'

import type { CommitId } from '@api/models'
import { useQueryCommitInfo } from '@api/queries'
import {
  ProfilePicture,
  type ProfilePictureVariant,
} from '@common/ProfilePicture'
import { makeTracked } from '@lib/SvgOverlay'
import { Marquee } from '@ui/Marquee'
import { cn, propsWithCn } from '@utils/styles'
import type { ParentCommitType } from '../Edges'

export type CommitType = 'confirmed' | 'unconfirmed'

export const NODE_SIZE = 26
export const COMMIT_ELEMENT_ID = (commitId: CommitId, refName: string) =>
  `commit_${commitId}_${refName}`

interface GraphCommitProps extends ComponentProps<'div'> {
  commitId: CommitId
  commitType: CommitType
  distance: number
}

const GraphCommit = makeTracked<
  GraphCommitProps,
  HTMLDivElement,
  ParentCommitType
>((props) => {
  const { commitId, commitType, distance, trackRef, ...divProps } = props
  const commitInfoQuery = useQueryCommitInfo(commitId)

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
          username={commitInfoQuery.data?.authorEmail}
          size="sm"
          variant={match(commitType)
            .returnType<ProfilePictureVariant>()
            .with('confirmed', () => 'primary')
            .with('unconfirmed', () => 'accent')
            .exhaustive()}
          className={cn('w-full h-full')}
        />
      </div>

      <Ariakit.CompositeItem
        rowId={`${distance}`}
        onClick={(e) => {
          if (e.detail === 0) {
            // TODO: open commit details
          }
        }}
        render={
          <div
            aria-selected={true}
            className={cn(
              'group/commit',
              'absolute left-full top-half translate-x-2 -translate-y-half w-80',
              'border-4 border-dark-600/85 rounded-sm shadow-md',
            )}
          />
        }
      >
        <div
          className={cn(
            'p-2 border-1 border-dark-100 rounded-sm',
            'bg-dark-700/75 dithered-dark-600/1',
            'group-hover/commit:dithered-dark-500/1 group-focus/commit:dithered-dark-500/1 group-data-focus/commit:dithered-dark-500/1',
            'flex flex-col gap-y-1',
          )}
        >
          <p
            className={cn('text-sm text-ellipsis text-nowrap overflow-hidden')}
          >
            {commitInfoQuery.data?.message ?? '...'}
          </p>
          <div
            className={cn('flex flex-row items-center justify-between gap-x-1')}
          >
            <Marquee className={cn('text-xs text-light-950')}>
              {commitInfoQuery.data?.authorName ?? '...'}
            </Marquee>

            <p className={cn('text-xs text-light-600 min-w-max')}>
              {commitInfoQuery.data?.shortHash ?? '...'}
            </p>
          </div>
        </div>
      </Ariakit.CompositeItem>
    </div>
  )
})

export { GraphCommit, type GraphCommitProps }
