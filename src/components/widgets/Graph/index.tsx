import { type ComponentProps, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import {
  defaultRangeExtractor,
  type Range,
  useVirtualizer,
} from '@tanstack/react-virtual'

import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { getPaginatedLength } from '@/api/utils'
import { BranchToolbar } from '@/common/BranchToolbar'
import { useSelectedBranches, useSelectedReferences } from '@/context/branches'
import { ScrollShadowDiv } from '@/lib/ScrollShadowDiv'
import { SvgOverlay } from '@/lib/SvgOverlay'
import { cn, propsWithCn } from '@/utils/styles'

import { GraphBaseBranch } from './Branch/Base'
import { GraphCurrentBranch } from './Branch/Current'
import { BranchSelectors } from './Branch/Selectors'
import { NODE_SIZE } from './Commit/Node'
import { CURVE_SIZE, EDGE_LENGTH, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentCommonAncestor } from './utils'

interface GraphProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the commit graph of the current repository.
 *
 * It has a simplified structure, only showing the checked out branch, and optionally a base branch that can be arbitrary.
 * The divergence point between both branches is computed, and the main branch "spawns" from that point.
 */
const Graph = (props: GraphProps) => {
  const { ...divProps } = props
  const { currentBranch, baseBranch } = useSelectedBranches()

  return (
    <div {...propsWithCn(divProps, 'h-full w-full min-h-0')}>
      <div
        className={cn(
          'overflow-hidden w-full h-full',
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_max-content_1fr]',
          'gap-y-1 gap-x-8 place-items-center',
        )}
      >
        <BranchSelectors />

        <BranchToolbar
          className={cn('col-start-1 row-start-2 w-40')}
          branch={currentBranch}
          fixed
        />

        <BranchToolbar
          className={cn('col-start-3 row-start-2 w-40')}
          branch={baseBranch}
          isBase
          fixed
        />

        <GraphInner />
      </div>
    </div>
  )
}

const GraphInner = () => {
  const { currentReference, baseReference } = useSelectedReferences()
  const commonAncestor = useCurrentCommonAncestor()

  const currentBranchHistoryQuery = useQueryCommitHistory(
    currentReference?.refName,
  )
  const baseBranchHistoryQuery = useQueryCommitHistory(baseReference?.refName)

  const baseBranchLength = getPaginatedLength(baseBranchHistoryQuery.data)
  const currentBranchLength = Math.min(
    (commonAncestor?.lastCommit?.distance ?? Number.POSITIVE_INFINITY) + 1,
    getPaginatedLength(currentBranchHistoryQuery.data),
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    getScrollElement: () => scrollContainerRef.current,
    rangeExtractor: (range: Range) => {
      const indexes = new Set(defaultRangeExtractor(range))

      if (commonAncestor?.commonCommit.distance !== undefined) {
        indexes.add(commonAncestor.commonCommit.distance)
      }
      if (commonAncestor?.lastCommit?.distance !== undefined) {
        indexes.add(commonAncestor.lastCommit.distance)
      }

      return [...indexes].sort((a, b) => a - b)
    },
    gap: EDGE_LENGTH,
    paddingStart: CURVE_SIZE * 2 + EDGE_OFFSET,
    paddingEnd: CURVE_SIZE * 2 + EDGE_OFFSET + 75,
    count: Math.max(currentBranchLength, baseBranchLength),
    overscan: 3,
  })

  return (
    <Ariakit.CompositeProvider focusLoop="horizontal" focusShift>
      <Ariakit.Composite
        render={
          <ScrollShadowDiv
            isScrolled={
              virtualizer.scrollOffset !== null && virtualizer.scrollOffset > 0
            }
            hasScrollLeft={
              virtualizer.scrollOffset !== null &&
              scrollContainerRef.current !== null &&
              virtualizer.scrollOffset <
                virtualizer.getTotalSize() -
                  scrollContainerRef.current?.clientHeight
            }
            className={cn('w-full h-full col-span-3 col-start-1 row-start-3')}
            size="md"
          />
        }
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            'overflow-auto scroll-smooth w-full h-full bg-dark-800/80',
            'will-change-transform',
          )}
        >
          <SvgOverlay
            RenderOverlay={Edges}
            className={cn('w-full')}
            style={{ height: virtualizer.getTotalSize() }}
          >
            {currentReference && (
              <GraphCurrentBranch items={virtualizer.getVirtualItems()} />
            )}

            {baseReference && (
              <GraphBaseBranch items={virtualizer.getVirtualItems()} />
            )}
          </SvgOverlay>
        </div>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  )
}

export { Graph }
