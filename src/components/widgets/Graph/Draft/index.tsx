import type { ComponentProps } from 'react'
import { mergeRefs } from 'react-merge-refs'

import { NODE_SIZE } from '../Commit/Node'
import { makeTracked } from '../SvgOverlay/utils'

const DRAFT_COMMIT_ID = 'commit_draft'

interface DraftCommitProps extends ComponentProps<'div'> {
  /**
   * The id of the last commit.
   */
  parentId: string | undefined
}

/**
 * A draft commit that represents uncommitted worktree changes.
 *
 * Registers/unregisters itself in the SVG overlay when mounted/unmounted.
 */
const DraftCommit = (props: DraftCommitProps) => {
  const { parentId, ...divProps } = props

  return (
    <DraftCommitInner
      {...divProps}
      elementId={DRAFT_COMMIT_ID}
      parent={
        parentId
          ? {
              id: parentId,
              type: 'draft',
            }
          : undefined
      }
    />
  )
}

const DraftCommitInner = makeTracked<ComponentProps<'div'>, HTMLDivElement>(
  (props) => {
    const { trackRef, ...divProps } = props

    return (
      <div {...divProps} ref={mergeRefs([trackRef, divProps.ref])}>
        <div
          className={'rounded-full shadow-sm p-0.5 bg-dark-50'}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        />
      </div>
    )
  },
)

export { DraftCommit, type DraftCommitProps }
