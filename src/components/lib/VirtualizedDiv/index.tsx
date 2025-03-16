import type { VirtualizerOptions } from '@tanstack/react-virtual'
import { type ComponentType, useMemo } from 'react'

import {
  ScrollShadowDiv,
  type ScrollShadowDivProps,
} from '@lib/ScrollShadowDiv'
import { type VirtualListOptions, useVirtualList } from '@utils/performance'
import { cn } from '@utils/styles'

interface VirtualizedDivProps<T> extends Partial<ScrollShadowDivProps> {
  items: T[]
  RenderItem: ComponentType<{ item: T }>
  itemSize: number
  options?: Partial<VirtualizerOptions<HTMLDivElement, Element>>
}

const VirtualizedDiv = <T,>(props: VirtualizedDivProps<T>) => {
  const { items, itemSize, RenderItem, options, ...divProps } = props

  const virtualizerOptions = useMemo<VirtualListOptions<HTMLDivElement>>(() => {
    return {
      estimateSize: () => itemSize,
      paddingStart: 8,
      paddingEnd: 8,
      gap: 8,
      count: items.length,
      overscan: 2,
      ...options,
    }
  }, [options, items.length, itemSize])

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList(virtualizerOptions)

  return (
    <ScrollShadowDiv
      isScrolled={isScrolled}
      hasScrollLeft={hasScrollLeft}
      {...divProps}
    >
      <div
        ref={scrollContainerRef}
        className={cn('overflow-y-auto w-full h-full px-2')}
      >
        <div
          className={cn('w-full relative')}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              className={cn('absolute top-0 left-0 w-full')}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <RenderItem item={items[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </ScrollShadowDiv>
  )
}

export { VirtualizedDiv, type VirtualizedDivProps }
