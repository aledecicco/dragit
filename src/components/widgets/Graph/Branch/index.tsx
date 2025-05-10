import type { Virtualizer } from '@tanstack/react-virtual'

import { useQueryBranchDivergence, useQueryCommitHistory } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { useSelectedUpstream } from '@context/upstream'
import { useBranch } from '@utils/repository'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  getGraphCommitData,
  useCurrentCommonAncestor,
  useInfiniteScroll,
} from '../utils'

type GraphBranchProps = {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  isBase: boolean
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, isBase } = props

  const { reference, baseReference } = useSelectedRefs()
  const currentRef = isBase ? baseReference : reference

  const historyQuery = useQueryCommitHistory(currentRef?.refName)
  const items = virtualizer.getVirtualItems()
  useInfiniteScroll(historyQuery, items)

  const { remote, remoteBranch } = useSelectedUpstream()
  const mainBranch = useBranch(reference)
  const mainDivergenceQuery = useQueryBranchDivergence(
    mainBranch?.type === 'local' ? mainBranch.name : undefined,
    remote && remoteBranch ? `${remote.name}/${remoteBranch}` : undefined,
  )

  const commonAncestor = useCurrentCommonAncestor()
  const anchor = isBase
    ? commonAncestor?.commonCommit
    : commonAncestor?.lastCommit
  const stopAtAnchor = !isBase
  if (stopAtAnchor && commonAncestor && anchor === null) {
    return
  }

  if (!historyQuery.data?.pages || !currentRef) {
    return
  }
  const currentRefName = currentRef.refName

  return items.map((virtualRow) => {
    if (anchor && stopAtAnchor && virtualRow.index > anchor.distance) {
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
        commitType={!isBase && isUnconfirmed ? 'unconfirmed' : 'confirmed'}
        elementId={COMMIT_ELEMENT_ID(commitData.hash, currentRefName)}
        parent={mapFn(commitData.parent, (parentCommit) => ({
          id: COMMIT_ELEMENT_ID(
            parentCommit,
            commitData.isAnchor && !!baseReference
              ? baseReference.refName
              : currentRefName,
          ),
          type: parentIsDistantAnchor
            ? 'dashed'
            : isUnconfirmed
              ? 'unconfirmed'
              : 'solid',
        }))}
        distance={virtualRow.index}
        className={cn('absolute top-0', isBase ? 'left-[55%]' : 'left-[3%]')}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
      />
    )
  })
}

export { GraphBranch, type GraphBranchProps }
