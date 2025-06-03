import type { ComponentType } from 'react'

import { cn } from '@utils/styles'

interface VirtualizedDivItemProps<T> {
  /**
   * The item that should be displayed.
   */
  item: T

  /**
   * The fixed height of the item.
   */
  itemSize: number

  /**
   * The position (index) of the item in the list.
   */
  position: number

  /**
   * A component constructor that will take care of rendering the inner content.
   */
  RenderItem: ComponentType<{ item: T }>
}

/**
 * Displays a single list item in a virtualized div.
 *
 * Automatically sets its position and height.
 */
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
