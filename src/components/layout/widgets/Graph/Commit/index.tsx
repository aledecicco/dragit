import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import type { CommitId } from '@/api/models'
import type { CommitIndexArgs } from '@/api/mutations/commitIndex'
import { useQueryCommitInfo } from '@/api/queries/commitInfo'
import { useAmendSomeCommitInteraction } from '@/interactions/commit'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { QueryLoader } from '@/lib/QueryLoader'
import { type Interaction, triggerInteraction } from '@/state/actions'
import { cn, propsWithCn } from '@/utils/styles'

import { makeTracked } from '../SvgOverlay/utils'
import { GraphCommitCard } from './Card'
import { GraphCommitNode } from './Node'

export type CommitType = 'confirmed' | 'unconfirmed'

export const COMMIT_ELEMENT_ID = (commitId: CommitId, refName: string) =>
  `commit_${commitId}_${refName}`

const COMMIT_WIDTH = 320
const COMMIT_HEIGHT = 66

interface GraphCommitProps extends ComponentProps<'div'> {
  /**
   * The hash of the commit to display.
   */
  commitId: CommitId

  /**
   * The type of the commit, used to determine the style of the node.
   */
  commitType: CommitType

  /**
   * The distance to this commit from the branch's tip.
   */
  distance: number

  /**
   * Whether this commit is the current one.
   */
  isCurrent?: boolean
}

/**
 * A single commit which displays a card with a short summary about it, and a node for edges to use as anchor.
 *
 * Registers/unregisters itself in the SVG overlay when mounted/unmounted.
 */
const GraphCommit = makeTracked<GraphCommitProps, HTMLDivElement>((props) => {
  const {
    commitId,
    commitType,
    distance,
    trackRef,
    isCurrent = false,
    ...divProps
  } = props

  const commitInfoQuery = useQueryCommitInfo(commitId)
  const amendCommit = useAmendSomeCommitInteraction()

  const commonStyles = {
    className: cn(
      'absolute left-full top-half translate-x-2 -translate-y-half',
      'border-4 border-dark-600 rounded-lg shadow-md',
    ),
    style: {
      width: COMMIT_WIDTH,
      height: COMMIT_HEIGHT,
    },
  }

  return (
    <div
      {...propsWithCn(divProps, 'relative animate-enter-fade-in')}
      ref={mergeRefs([trackRef, divProps.ref])}
    >
      <GraphCommitNode commitType={commitType} />

      {isCurrent ? (
        <DropArea
          acceptedTypes={['index']}
          label={{
            index: 'amend this commit',
          }}
          handleDrop={() => {
            if (commitInfoQuery.data) {
              triggerInteraction({
                ...amendCommit(commitInfoQuery.data),
                argsRequester: () => ({
                  message: commitInfoQuery.data.message,
                  isAmend: true,
                }),
              } as Interaction<CommitIndexArgs>)
            }
          }}
          {...commonStyles}
          overlayProps={{
            className: cn('flex-row text-sm'),
          }}
        >
          <GraphCommitInner
            commitId={commitId}
            distance={distance}
            isCurrent={isCurrent}
          />
        </DropArea>
      ) : (
        <GraphCommitInner
          commitId={commitId}
          distance={distance}
          isCurrent={isCurrent}
          {...commonStyles}
        />
      )}
    </div>
  )
})

interface GraphCommitInnerProps extends ComponentProps<'div'> {
  commitId: CommitId

  distance: number

  isCurrent: boolean
}

const GraphCommitInner = (props: GraphCommitInnerProps) => {
  const { commitId, distance, isCurrent, ...divProps } = props

  const commitInfoQuery = useQueryCommitInfo(commitId)

  return (
    <div {...divProps}>
      <QueryLoader query={commitInfoQuery}>
        {(commitInfo) => (
          <Ariakit.CompositeItem
            rowId={`${distance}`}
            render={
              <GraphCommitCard commitInfo={commitInfo} isCurrent={isCurrent} />
            }
          />
        )}
      </QueryLoader>
    </div>
  )
}

export { GraphCommit, type GraphCommitProps }
