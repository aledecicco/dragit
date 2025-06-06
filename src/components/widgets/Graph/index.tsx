import * as Ariakit from '@ariakit/react'
import {
  type Range,
  defaultRangeExtractor,
  useVirtualizer,
} from '@tanstack/react-virtual'
import { type ComponentProps, memo, useCallback, useMemo, useRef } from 'react'

import { useQueryCommitHistory } from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { BranchToolbar } from '@common/BranchToolbar'
import { useSelectedRefs } from '@context/branches'
import { ScrollShadowDiv } from '@lib/ScrollShadowDiv'
import { SvgOverlay } from '@lib/SvgOverlay'
import { useSelectedBranches } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'
import { GraphBranch } from './Branch'
import { BranchMessages } from './Branch/Messages'
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
const Graph = memo((props: GraphProps) => {
  const { ...divProps } = props
  const { branch, baseBranch } = useSelectedBranches()

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
          branch={branch}
          fixed
          className={cn('col-start-1 row-start-2 w-40')}
        />

        <BranchToolbar
          branch={baseBranch}
          fixed
          className={cn('col-start-3 row-start-2 w-40')}
        />

        <GraphInner />
      </div>
    </div>
  )
})

const GraphInner = memo(() => {
  const { reference, baseReference } = useSelectedRefs()
  const commonAncestor = useCurrentCommonAncestor()

  const branchHistoryQuery = useQueryCommitHistory(reference?.refName)
  const baseBranchHistoryQuery = useQueryCommitHistory(baseReference?.refName)

  const branchLength = useMemo(() => {
    return Math.min(
      (commonAncestor?.lastCommit?.distance ?? Number.POSITIVE_INFINITY) + 1,
      getPaginatedLength(branchHistoryQuery.data),
    )
  }, [commonAncestor, branchHistoryQuery.data])

  const baseLength = useMemo(() => {
    return getPaginatedLength(baseBranchHistoryQuery.data)
  }, [baseBranchHistoryQuery.data])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    estimateSize: useCallback(() => NODE_SIZE, []),
    rangeExtractor: useCallback(
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
      [
        commonAncestor?.commonCommit.distance,
        commonAncestor?.lastCommit?.distance,
      ],
    ),
    gap: EDGE_LENGTH,
    paddingStart: CURVE_SIZE * 2 + EDGE_OFFSET,
    paddingEnd: CURVE_SIZE * 2.5 + EDGE_OFFSET * 2,
    count: Math.max(branchLength, baseLength),
    overscan: 3,
    getScrollElement: useCallback(() => scrollContainerRef.current, []),
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
            {reference && (
              <GraphBranch virtualizer={virtualizer} isBase={false} />
            )}

            {baseReference && <GraphBranch virtualizer={virtualizer} isBase />}
          </SvgOverlay>
        </div>
        <BranchMessages />
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  )
})

export { Graph }
