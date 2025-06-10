import {
  type VirtualizerOptions,
  useVirtualizer,
} from '@tanstack/react-virtual'
import { type ReactNode, useRef } from 'react'

import {
  ScrollShadowDiv,
  type ScrollShadowDivProps,
} from '@lib/ScrollShadowDiv'
import { cn } from '@utils/styles'
import { VirtualizedDivItem } from './Item'

interface VirtualizedDivProps<T> extends Partial<ScrollShadowDivProps> {
  /**
   * The list of all items available.
   */
  items: T[] | undefined

  /**
   * Render function for each item.
   */
  renderItem: (item: T) => ReactNode

  /**
   * The fixed height of each item.
   */
  itemSize: number

  /**
   * Additional option overrides for the virtualizer.
   */
  options?: Partial<VirtualizerOptions<HTMLDivElement, Element>>

  /**
   * Fallback to display while no items are available.
   */
  fallback?: ReactNode
}

/**
 * A div that automatically initializes a virtualized list.
 *
 * Displays shadows to signal scrollable content.
 */
const VirtualizedDiv = <T,>(props: VirtualizedDivProps<T>) => {
  const { items, itemSize, renderItem, options, fallback, ...divProps } = props

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    estimateSize: () => itemSize,
    getScrollElement: () => scrollContainerRef.current,
    paddingStart: 8,
    paddingEnd: 8,
    gap: 8,
    count: items?.length ?? 0,
    overscan: 2,
    ...options,
  })

  if (!items?.length) {
    return fallback
  }

  return (
    <ScrollShadowDiv
      isScrolled={
        virtualizer.scrollOffset !== null && virtualizer.scrollOffset > 0
      }
      hasScrollLeft={
        virtualizer.scrollOffset !== null &&
        scrollContainerRef.current !== null &&
        virtualizer.scrollOffset <
          virtualizer.getTotalSize() - scrollContainerRef.current?.clientHeight
      }
      {...divProps}
    >
      <div
        ref={scrollContainerRef}
        className={cn('overflow-y-auto w-full max-h-full px-2 scroll-smooth')}
      >
        <div
          className={cn('w-full relative')}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <VirtualizedDivItem
              key={virtualRow.key}
              itemSize={itemSize}
              position={virtualRow.start}
            >
              {renderItem(items[virtualRow.index])}
            </VirtualizedDivItem>
          ))}
        </div>
      </div>
    </ScrollShadowDiv>
  )
}

export { VirtualizedDiv, type VirtualizedDivProps }
