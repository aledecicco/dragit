import { type ComponentProps, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { defaultRangeExtractor, type Range } from '@tanstack/react-virtual'

import { SvgOverlay } from '@/layout/widgets/Graph/SvgOverlay'

import { useQueryCommitHistory } from '@/api/queries/commitHistory'
import { useQueryCommonAncestor } from '@/api/queries/commonAncestor'
import { getPaginatedLength } from '@/api/utils'
import { BranchToolbar } from '@/common/BranchToolbar'
import { ScrollShadowDiv } from '@/lib/ScrollShadowDiv'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { useSelectedBase } from '@/state/branches'
import { useSettings } from '@/state/storage'
import { useVirtualizer } from '@/utils/performance'
import {
  useBranch,
  useCurrentBaseBranch,
  useHeadReference,
} from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'

import { GraphBaseBranch } from './Branch/Base'
import { GraphCurrentBranch } from './Branch/Current'
import { BranchSelectors } from './Branch/Selectors'
import { NODE_SIZE } from './Commit/Node'
import { GraphDropAreas } from './DropAreas'
import { CURVE_SIZE, EDGE_LENGTH, EDGE_OFFSET } from './Edges/utils'

interface GraphProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the commit graph of the current repository.
 *
 * It has a simplified structure, only showing the checked out branch, and optionally a base branch that can be arbitrary.
 * The divergence point between both branches is computed, and the main branch "spawns" from that point.
 */
const Graph = (props: GraphProps) => {
  const { ...divProps } = props

  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)
  const baseBranch = useCurrentBaseBranch()

  return (
    <div {...propsWithCn(divProps, 'h-full w-full min-h-0')}>
      <div
        className={cn(
          'overflow-hidden w-full h-full',
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_max-content_1fr]',
          'gap-y-1 gap-x-8 place-items-center',
          'relative',
        )}
      >
        <BranchSelectors />

        {currentBranch && (
          <BranchToolbar
            className={cn('col-start-1 row-start-2 w-40')}
            branch={currentBranch}
            fixed
          />
        )}

        {baseBranch && (
          <BranchToolbar
            className={cn('col-start-3 row-start-2 w-40')}
            branch={baseBranch}
            isBase
            fixed
          />
        )}

        <div
          className={cn(
            'col-span-3 row-start-3 overflow-hidden w-full h-full relative',
          )}
        >
          <GraphInner />
        </div>

        <GraphDropAreas />
      </div>
    </div>
  )
}

const GraphInner = () => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)
  const commonAncestor = useQueryCommonAncestor(
    currentReference?.refName,
    baseReference?.refName,
  ).data

  const currentBranchHistoryQuery = useQueryCommitHistory(
    currentReference?.refName,
  )
  const baseBranchHistoryQuery = useQueryCommitHistory(baseReference?.refName)

  const baseBranchLength = commonAncestor?.commonCommit
    ? Math.max(
        commonAncestor.commonCommit.distance + 1,
        getPaginatedLength(baseBranchHistoryQuery.data),
      )
    : getPaginatedLength(baseBranchHistoryQuery.data)
  const currentBranchLength =
    commonAncestor?.lastCommit?.distance !== undefined
      ? Math.max(
          commonAncestor.lastCommit.distance + 1,
          getPaginatedLength(currentBranchHistoryQuery.data),
        )
      : getPaginatedLength(currentBranchHistoryQuery.data)

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

      return [...indexes.values()].sort((a, b) => a - b)
    },
    gap: EDGE_LENGTH,
    paddingStart: CURVE_SIZE * 2 + EDGE_OFFSET,
    paddingEnd: CURVE_SIZE * 2 + EDGE_OFFSET + 75,
    count: Math.max(currentBranchLength, baseBranchLength),
    overscan: 3,
  })

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusMainShortcut, () => {
    ref.current?.focus()
  })

  return (
    <Ariakit.CompositeProvider focusLoop="horizontal" focusShift>
      <Ariakit.Composite
        ref={ref}
        focusable
        className={cn('border border-transparent focus:border-dark-100')}
        render={
          <ScrollShadowDiv
            isScrolled={
              virtualizer.scrollOffset !== null && virtualizer.scrollOffset > 0
            }
            hasScrollLeft={
              virtualizer.scrollOffset !== null &&
              virtualizer.scrollElement !== null &&
              virtualizer.scrollOffset <
                virtualizer.totalSize - virtualizer.scrollElement.clientHeight
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
            className={cn('w-full')}
            style={{ height: virtualizer.totalSize }}
          >
            <GraphCurrentBranch items={virtualizer.virtualItems} />

            <GraphBaseBranch items={virtualizer.virtualItems} />
          </SvgOverlay>
        </div>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  )
}

export { Graph }
