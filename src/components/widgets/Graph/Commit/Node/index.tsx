import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { CommitInfo } from '@api/models'
import {
  ProfilePicture,
  type ProfilePictureVariant,
} from '@common/ProfilePicture'
import { cn, propsWithCn } from '@utils/styles'
import type { CommitType } from '..'

export const NODE_SIZE = 26

interface GraphCommitNodeProps extends ComponentProps<'div'> {
  commitType: CommitType
  commitInfo: CommitInfo | undefined
}

const GraphCommitNode = (props: GraphCommitNodeProps) => {
  const { commitType, commitInfo, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
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
        username={commitInfo?.authorEmail}
        size="sm"
        variant={match(commitType)
          .returnType<ProfilePictureVariant>()
          .with('confirmed', () => 'primary')
          .with('unconfirmed', () => 'accent')
          .exhaustive()}
        className={cn('w-full h-full')}
      />
    </div>
  )
}

export { GraphCommitNode, type GraphCommitNodeProps }
