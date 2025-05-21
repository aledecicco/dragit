import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { CommitInfo } from '@api/models'
import { propsWithCn } from '@utils/styles'
import type { CommitType } from '..'

export const NODE_SIZE = 15

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
    />
  )
}

export { GraphCommitNode, type GraphCommitNodeProps }
