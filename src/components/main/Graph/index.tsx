import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'

import { commitHistoryQuery } from '@api/queries'
import { getPaginatedLength, useRepositoryInfiniteQuery } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { GraphAnchor } from './Anchor'
import { GraphBranch } from './Branch'
import { BranchMessages } from './Branch/Messages'
import { BranchSelectors } from './Branch/Selectors'
import { BranchToolbars } from './Branch/Toolbars'
import { NODE_SIZE } from './Commit'
import { CURVE_SIZE, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentCommonAncestor } from './utils'

const Graph = () => {
  return (
    <div className={clsx('h-full w-full min-h-0')}>
      <div
        className={clsx(
          'overflow-hidden w-full h-full relative',
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_max-content_1fr]',
          'gap-x-8 place-items-center py-1',
        )}
      >
        <BranchSelectors />

        <BranchToolbars />

        <SvgOverlay
          className={clsx('col-span-3 col-start-1 row-start-3 mt-4')}
          RenderOverlay={Edges}
        >
          <GraphInner />
        </SvgOverlay>

        <BranchMessages />
      </div>
    </div>
  )
}

const GraphInner = () => {
  const { branch, baseBranch } = useSelectedBranches()
  const commonAncestor = useCurrentCommonAncestor()

  const svgOverlay = useSvgOverlay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh arrows when branches change
  useEffect(() => {
    svgOverlay.refresh()
  }, [commonAncestor, branch, baseBranch])

  const branchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    branch?.name,
  )
  const baseBranchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    baseBranch?.name,
  )

  const branchLength = useMemo(() => {
    return Math.min(
      (commonAncestor?.lastCommit?.distance ?? Number.POSITIVE_INFINITY) + 1,
      getPaginatedLength(branchHistory.data),
    )
  }, [commonAncestor, branchHistory.data])
  const baseLength = useMemo(() => {
    return getPaginatedLength(baseBranchHistory.data)
  }, [baseBranchHistory.data])

  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
    paddingEnd: CURVE_SIZE * 3.5,
    getScrollElement: () => svgOverlay.componentRef.current,
    count: Math.max(branchLength, baseLength),
  })

  return (
    <div
      ref={svgOverlay.componentRef}
      className={clsx(
        'overflow-hidden contain-strict w-full h-full bg-dark-900/50',
      )}
    >
      <div
        className={clsx('relative w-full contain-layout')}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {branch && (
          <GraphBranch
            virtualizer={virtualizer}
            branch={branch}
            anchor={commonAncestor?.lastCommit}
            isBase={false}
          />
        )}

        {baseBranch && (
          <GraphBranch
            virtualizer={virtualizer}
            branch={baseBranch}
            anchor={commonAncestor?.commonCommit ?? undefined}
            isBase={true}
          />
        )}

        {branch && baseBranch && commonAncestor && (
          <GraphAnchor
            virtualizer={virtualizer}
            branch={branch}
            baseBranch={baseBranch}
            commonAncestorInfo={commonAncestor}
          />
        )}
      </div>
    </div>
  )
}

export { Graph }
