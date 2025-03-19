import { type Range, defaultRangeExtractor } from '@tanstack/react-virtual'
import { useCallback, useMemo } from 'react'

import { commitHistoryQuery } from '@api/queries'
import { getPaginatedLength, useRepositoryInfiniteQuery } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { ScrollShadowDiv } from '@lib/ScrollShadowDiv'
import { SvgOverlay } from '@lib/SvgOverlay'
import { type VirtualListOptions, useVirtualList } from '@utils/performance'
import { cn } from '@utils/styles'
import { GraphBranch } from './Branch'
import { BranchMessages } from './Branch/Messages'
import { BranchSelectors } from './Branch/Selectors'
import { BranchToolbars } from './Branch/Toolbars'
import { NODE_SIZE } from './Commit'
import { CURVE_SIZE, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentCommonAncestor } from './utils'

const Graph = () => {
  return (
    <div className={cn('h-full w-full min-h-0')}>
      <div
        className={cn(
          'overflow-hidden w-full h-full',
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_max-content_1fr]',
          'gap-y-1 gap-x-8 place-items-center py-1',
        )}
      >
        <BranchSelectors />

        <BranchToolbars />

        <GraphInner />
      </div>
    </div>
  )
}

const GraphInner = () => {
  const { branch, baseBranch } = useSelectedBranches()
  const commonAncestor = useCurrentCommonAncestor()

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

  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = new Set(defaultRangeExtractor(range))

      if (commonAncestor?.commonCommit.distance !== undefined) {
        indexes.add(commonAncestor.commonCommit.distance)
      }
      if (commonAncestor?.lastCommit?.distance !== undefined) {
        indexes.add(commonAncestor.lastCommit.distance)
      }

      return [...indexes].sort((a, b) => a - b)
    },
    [commonAncestor],
  )

  const virtualizerOptions = useMemo<VirtualListOptions<HTMLDivElement>>(() => {
    return {
      estimateSize: () => NODE_SIZE,
      rangeExtractor: rangeExtractor,
      gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
      paddingStart: CURVE_SIZE * 2 + EDGE_OFFSET,
      paddingEnd: CURVE_SIZE * 2.5 + EDGE_OFFSET * 2,
      count: Math.max(branchLength, baseLength),
    }
  }, [branchLength, baseLength, rangeExtractor])

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList(virtualizerOptions)

  return (
    <ScrollShadowDiv
      isScrolled={isScrolled}
      hasScrollLeft={hasScrollLeft}
      className={cn('w-full h-full col-span-3 col-start-1 row-start-3')}
    >
      <div
        ref={scrollContainerRef}
        className={cn(
          'overflow-auto contain-strict w-full h-full bg-dark-800/80',
        )}
      >
        <SvgOverlay
          RenderOverlay={Edges}
          className={cn('w-full contain-layout')}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {branch && (
            <GraphBranch
              virtualizer={virtualizer}
              branch={branch}
              anchor={commonAncestor?.lastCommit}
              isBase={false}
              baseBranch={baseBranch}
            />
          )}

          {baseBranch && (
            <GraphBranch
              virtualizer={virtualizer}
              branch={baseBranch}
              anchor={commonAncestor?.commonCommit}
              isBase
            />
          )}
        </SvgOverlay>
      </div>
      <BranchMessages />
    </ScrollShadowDiv>
  )
}

export { Graph }
