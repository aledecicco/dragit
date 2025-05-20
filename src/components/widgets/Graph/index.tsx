import * as Ariakit from '@ariakit/react'
import { type Range, defaultRangeExtractor } from '@tanstack/react-virtual'
import { type ComponentProps, useCallback, useMemo } from 'react'

import { useQueryCommitHistory } from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { BranchToolbar } from '@common/BranchToolbar'
import { useSelectedRefs } from '@context/branches'
import { ScrollShadowDiv } from '@lib/ScrollShadowDiv'
import { SvgOverlay } from '@lib/SvgOverlay'
import { type VirtualListOptions, useVirtualList } from '@utils/performance'
import { useSelectedBranches } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'
import { GraphBranch } from './Branch'
import { BranchMessages } from './Branch/Messages'
import { BranchSelectors } from './Branch/Selectors'
import { NODE_SIZE } from './Commit/Node'
import { CURVE_SIZE, EDGE_LENGTH, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentCommonAncestor } from './utils'

interface GraphProps extends ComponentProps<'div'> {}

const Graph = (props: GraphProps) => {
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
}

const GraphInner = () => {
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
      gap: EDGE_LENGTH,
      paddingStart: CURVE_SIZE * 2 + EDGE_OFFSET,
      paddingEnd: CURVE_SIZE * 2.5 + EDGE_OFFSET * 2,
      count: Math.max(branchLength, baseLength),
      overscan: 3,
    }
  }, [branchLength, baseLength, rangeExtractor])

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList(virtualizerOptions)

  return (
    <Ariakit.CompositeProvider focusLoop="horizontal" focusShift>
      <Ariakit.Composite
        render={
          <ScrollShadowDiv
            isScrolled={isScrolled}
            hasScrollLeft={hasScrollLeft}
            className={cn('w-full h-full col-span-3 col-start-1 row-start-3')}
            size="md"
          />
        }
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            'overflow-auto scroll-smooth w-full h-full bg-dark-800/80',
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
}

export { Graph }
