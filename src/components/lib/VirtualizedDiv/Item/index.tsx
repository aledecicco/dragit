import type { ComponentType } from 'react'

import { cn } from '@utils/styles'

interface VirtualizedDivItemProps<T> {
  item: T
  itemSize: number
  position: number
  RenderItem: ComponentType<{ item: T }>
}

const VirtualizedDivItem = <T,>(props: VirtualizedDivItemProps<T>) => {
  const { item, itemSize, position, RenderItem } = props

  return (
    <div
      className={cn('absolute top-0 left-0 w-full')}
      style={{
        transform: `translateY(${position}px)`,
        height: itemSize,
      }}
    >
      <RenderItem item={item} />
    </div>
  )
}

export { VirtualizedDivItem, type VirtualizedDivItemProps }
