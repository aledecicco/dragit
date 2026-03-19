import type { VirtualItem } from '@tanstack/react-virtual'

import { useQueryBranchDivergence } from '@/api/queries/branchDivergence'
import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { useQueryCommonAncestor } from '@/api/queries/commonAncestor'
import { getPaginatedLength } from '@/api/utils'
import { useSelectedBase } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import {
  getUpstreamReference,
  useBranch,
  useHeadReference,
} from '@/utils/repository'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { COMMIT_ELEMENT_ID, GraphCommit } from '../../Commit'
import {
  ancestorIsDivergent,
  getGraphCommitData,
  useInfiniteScroll,
} from '../../utils'
import { BranchMessage } from '../Message'

interface GraphCurrentBranchProps {
  /**
   * The virtual items representing the commits currently being displayed.
   */
  items: (VirtualItem | undefined)[]
}

/**
 * Loads commits for the current branch from the given virtual items,
 * and displays them as a graph correctly setting their styles, positions, and parents.
 */
const GraphCurrentBranch = (props: GraphCurrentBranchProps) => {
  const { items: itemsArg } = props
  const items = itemsArg.filter((item) => !!item)

  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)

  const historyQuery = useQueryCommitHistory(currentReference?.refName)
  useInfiniteScroll(historyQuery, items)

  const currentBranch = useBranch(currentReference)
  const upstream = useSelectedUpstream(currentBranch)
  const mainDivergenceQuery = useQueryBranchDivergence(
    currentBranch?.type === 'local' ? currentBranch.name : undefined,
    upstream ? getUpstreamReference(upstream).refName : undefined,
  )

  const commonAncestor = useQueryCommonAncestor(
    currentReference?.refName,
    baseReference?.refName,
  ).data
  const anchor = commonAncestor?.lastCommit

  if (!currentReference) {
    return <BranchMessage isBase={false}>No branch checked out</BranchMessage>
  }

  if (commonAncestor && anchor === null) {
    return <BranchMessage isBase={false}>No new commits</BranchMessage>
  }

  if (!historyQuery.data || !getPaginatedLength(historyQuery.data)) {
    return (
      <BranchMessage isBase={false}>
        {historyQuery.isFetching ? 'Loading history...' : 'No commits found'}
      </BranchMessage>
    )
  }

  return items.map((virtualRow) => {
    if (anchor && virtualRow.index > anchor.distance) {
      return undefined
    }

    const commitData = getGraphCommitData(virtualRow, historyQuery.data, anchor)
    if (!commitData) {
      return undefined
    }

    const parentIsDistantAnchor =
      anchor &&
      commitData.parent === anchor.hash &&
      anchor.distance > virtualRow.index + 1

    const isUnconfirmed =
      !!mainDivergenceQuery.data &&
      ancestorIsDivergent(virtualRow.index, mainDivergenceQuery.data)

    return (
      <GraphCommit
        key={commitData.hash}
        commitId={commitData.hash}
        commitType={isUnconfirmed ? 'unconfirmed' : 'confirmed'}
        elementId={COMMIT_ELEMENT_ID(commitData.hash, currentReference.refName)}
        isCurrent={virtualRow.index === 0}
        parent={mapFn(commitData.parent, (parentCommit) => ({
          id: COMMIT_ELEMENT_ID(
            parentCommit,
            commitData.isAnchor && !!baseReference
              ? baseReference.refName
              : currentReference.refName,
          ),
          type: parentIsDistantAnchor
            ? 'dashed'
            : isUnconfirmed
              ? 'unconfirmed'
              : 'solid',
        }))}
        distance={virtualRow.index}
        className={cn('absolute top-0 left-[3%]')}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
      />
    )
  })
}

export { GraphCurrentBranch, type GraphCurrentBranchProps }
