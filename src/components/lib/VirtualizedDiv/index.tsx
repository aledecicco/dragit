import type { VirtualizerOptions } from '@tanstack/react-virtual'
import { type ComponentType, useMemo } from 'react'

import {
  ScrollShadowDiv,
  type ScrollShadowDivProps,
} from '@lib/ScrollShadowDiv'
import { useVirtualList } from '@utils/performance'
import { cn } from '@utils/styles'
import { VirtualizedDivItem } from './Item'

interface VirtualizedDivProps<T> extends Partial<ScrollShadowDivProps> {
  items: T[]
  RenderItem: ComponentType<{ item: T }>
  itemSize: number
  options?: Partial<VirtualizerOptions<HTMLDivElement, Element>>
}

const VirtualizedDiv = <T,>(props: VirtualizedDivProps<T>) => {
  const { items, itemSize, RenderItem, options, ...divProps } = props

  const { scrollContainerRef, virtualizer, isScrolled, hasScrollLeft } =
    useVirtualList(
      useMemo(() => {
        return {
          estimateSize: () => itemSize,
          paddingStart: 8,
          paddingEnd: 8,
          gap: 8,
          count: items.length,
          overscan: 2,
          ...options,
        }
      }, [options, items.length, itemSize]),
    )

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
