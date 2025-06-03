import type { VirtualizerOptions } from '@tanstack/react-virtual'
import { type ComponentType, type ReactNode, useMemo } from 'react'

import {
  ScrollShadowDiv,
  type ScrollShadowDivProps,
} from '@lib/ScrollShadowDiv'
import { useVirtualList } from '@utils/performance'
import { cn } from '@utils/styles'
import { VirtualizedDivItem } from './Item'

interface VirtualizedDivProps<T> extends Partial<ScrollShadowDivProps> {
  /**
   * The list of all items available.
   */
  items: T[] | undefined

  /**
   * A component constructor that will take care of rendering each item.
   */
  RenderItem: ComponentType<{ item: T }>

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
  const { items, itemSize, RenderItem, options, fallback, ...divProps } = props

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList(
      useMemo(() => {
        return {
          estimateSize: () => itemSize,
          paddingStart: 8,
          paddingEnd: 8,
          gap: 8,
          count: items?.length ?? 0,
          overscan: 2,
          ...options,
        }
      }, [options, items?.length, itemSize]),
    )

  if (!items?.length) {
    return fallback
  }

  return (
    <ScrollShadowDiv
      isScrolled={isScrolled}
      hasScrollLeft={hasScrollLeft}
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
              item={items[virtualRow.index]}
              itemSize={itemSize}
              position={virtualRow.start}
              RenderItem={RenderItem}
            />
          ))}
        </div>
      </div>
    </ScrollShadowDiv>
  )
}

export { VirtualizedDiv, type VirtualizedDivProps }
