import type { VirtualItem } from '@tanstack/react-virtual'

import type { CommitId } from '@/api/models'
import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { useQueryCommonAncestor } from '@/api/queries/commonAncestor'
import { getPaginatedLength } from '@/api/utils'
import { useSelectedBase } from '@/state/branches'
import { useHeadReference } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { ANCHOR_ELEMENT_ID, COMMIT_ELEMENT_ID, GraphCommit } from '../../Commit'
import { getGraphCommitData, useInfiniteScroll } from '../../utils'
import { BranchMessage } from '../Message'

interface GraphBaseBranchProps {
  /**
   * The virtual items representing the commits currently being displayed.
   */
  items: (VirtualItem | undefined)[]
}

/**
 * Loads commits for the base branch from the given virtual items,
 * and displays them as a graph correctly setting their styles, positions, and parents.
 */
const GraphBaseBranch = (props: GraphBaseBranchProps) => {
  const { items: itemsArg } = props
  const items = itemsArg.filter((item) => !!item)

  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)

  const historyQuery = useQueryCommitHistory(baseReference?.refName)
  useInfiniteScroll(historyQuery, items)

  const commonAncestor = useQueryCommonAncestor(
    currentReference?.refName,
    baseReference?.refName,
  ).data
  const anchor = commonAncestor?.commonCommit

  const idFor = (hash: CommitId) =>
    hash === anchor?.hash ? ANCHOR_ELEMENT_ID : COMMIT_ELEMENT_ID(hash, 'base')

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

    // Avoid duplicate items if the anchor pops up at a different index (during a base switch).
    if (anchor && commitData.isAnchor && virtualRow.index !== anchor.distance) {
      return undefined
    }

    const parentIsDistantAnchor =
      anchor &&
      commitData.parent === anchor.hash &&
      anchor.distance > virtualRow.index + 1

    const elementId = idFor(commitData.hash)

    return (
      <GraphCommit
        key={elementId}
        commitId={commitData.hash}
        commitType="confirmed"
        elementId={elementId}
        isCurrent={
          virtualRow.index === 0 &&
          commonAncestor?.lastCommit === null &&
          commitData.hash === commonAncestor?.commonCommit?.hash
        }
        parent={mapFn(commitData.parent, (parentCommit) => ({
          id: idFor(parentCommit),
          type: parentIsDistantAnchor ? 'dashed' : 'solid',
        }))}
        distance={virtualRow.index}
        targetY={virtualRow.start}
        className={cn('absolute top-0 left-[55%]')}
      />
    )
  })
}

export { GraphBaseBranch, type GraphBaseBranchProps }
