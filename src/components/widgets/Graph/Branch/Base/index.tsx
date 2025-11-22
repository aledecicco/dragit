import type { VirtualItem } from '@tanstack/react-virtual'

import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { getPaginatedLength } from '@/api/utils'
import { useSelectedReferences } from '@/context/branches'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { COMMIT_ELEMENT_ID, GraphCommit } from '../../Commit'
import {
  getGraphCommitData,
  useCurrentCommonAncestor,
  useInfiniteScroll,
} from '../../utils'
import { BranchMessage } from '../Message'

interface GraphBaseBranchProps {
  /**
   * The virtual items representing the commits currently being displayed.
   */
  items: VirtualItem[]
}

/**
 * Loads commits for the base branch from the given virtual items,
 * and displays them as a graph correctly setting their styles, positions, and parents.
 *
 * TODO: The compiler's memoization might cause issues here: https://github.com/TanStack/virtual/issues/736
 */
const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { items } = props

  const { baseReference } = useSelectedReferences()

  const historyQuery = useQueryCommitHistory(baseReference?.refName)
  useInfiniteScroll(historyQuery, items)

  const commonAncestor = useCurrentCommonAncestor()
  const anchor = commonAncestor?.commonCommit

  if (!baseReference) {
    return <BranchMessage isBase={true}>No base branch selected</BranchMessage>
  }

  if (!historyQuery.data || !getPaginatedLength(historyQuery.data)) {
    return (
      <BranchMessage isBase={true}>
        {historyQuery.isFetching ? 'Loading history...' : 'No commits found'}
      </BranchMessage>
    )
  }

  return items.map((virtualRow) => {
    const commitData = getGraphCommitData(virtualRow, historyQuery.data, anchor)
    if (!commitData) {
      return undefined
    }

    const parentIsDistantAnchor =
      anchor &&
      commitData.parent === anchor.hash &&
      anchor.distance > virtualRow.index + 1

    return (
      <GraphCommit
        key={commitData.hash}
        commitId={commitData.hash}
        commitType="confirmed"
        elementId={COMMIT_ELEMENT_ID(commitData.hash, baseReference.refName)}
        parent={mapFn(commitData.parent, (parentCommit) => ({
          id: COMMIT_ELEMENT_ID(parentCommit, baseReference.refName),
          type: parentIsDistantAnchor ? 'dashed' : 'solid',
        }))}
        distance={virtualRow.index}
        className={cn('absolute top-0 left-[55%]')}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
      />
    )
  })
}

export { GraphBaseBranch, type GraphBaseBranchProps }
