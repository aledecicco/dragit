import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import type { CommitId } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useQueryCommitInfo } from '@/api/queries/commitInfo'
import { showCreateBranchDialog } from '@/common/CreateBranchDialog'
import { ContextMenu } from '@/lib/ContextMenu'
import { QueryLoader } from '@/lib/Loader/Query'
import { makeTracked } from '@/lib/SvgOverlay'
import { MenuItem } from '@/ui/Menu/Item'
import { cn, propsWithCn } from '@/utils/styles'

import type { ParentCommitType } from '../Edges'
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
}

/**
 * TODO: is this being optimized by the compiler?
 *
 * A single commit which displays a card with a short summary about it, and a node for edges to use as anchor.
 *
 * Registers/unregisters itself in the SVG overlay when mounted/unmounted.
 */
const GraphCommit = makeTracked<
  GraphCommitProps,
  HTMLDivElement,
  ParentCommitType
>((props) => {
  const { commitId, commitType, distance, trackRef, ...divProps } = props
  const commitInfoQuery = useQueryCommitInfo(commitId)

  const createBranch = useCreateBranchAt(commitId)
  const branchOff = useBranchOff(commitId)

  return (
    <ContextMenu
      items={
        <>
          <MenuItem
            action={createBranch}
            trackOnly
            onClick={() => {
              showCreateBranchDialog({ fromReference: commitId, jump: false })
            }}
          />
          <MenuItem
            action={branchOff}
            trackOnly
            onClick={() => {
              showCreateBranchDialog({ fromReference: commitId, jump: true })
            }}
          />
        </>
      }
    >
      <div
        {...propsWithCn(divProps, 'relative')}
        ref={mergeRefs([trackRef, divProps.ref])}
      >
        <GraphCommitNode commitType={commitType} />

        <div
          className={cn(
            'absolute left-full top-half translate-x-2 -translate-y-half',
            'border-4 border-dark-600 rounded-lg shadow-md',
          )}
          style={{
            width: COMMIT_WIDTH,
            height: COMMIT_HEIGHT,
          }}
        >
          <QueryLoader query={commitInfoQuery}>
            {(commitInfo) => (
              <Ariakit.CompositeItem
                rowId={`${distance}`}
                render={<GraphCommitCard commitInfo={commitInfo} />}
              />
            )}
          </QueryLoader>
        </div>
      </div>
    </ContextMenu>
  )
})

export { GraphCommit, type GraphCommitProps }
