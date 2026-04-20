import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'

import type { CommitType } from '..'

export const NODE_SIZE = 15

interface GraphCommitNodeProps extends ComponentProps<'div'> {
  /**
   * The type of the commit, used to determine the style of the node.
   */
  commitType: CommitType
}

/**
 * The node used as anchor by edges in the commit graph.
 */
const GraphCommitNode = (props: GraphCommitNodeProps) => {
  const { commitType, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'rounded-full shadow-sm p-0.5',
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
