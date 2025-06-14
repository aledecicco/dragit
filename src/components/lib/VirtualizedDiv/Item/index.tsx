import type { ComponentProps } from 'react'

import { propsWithCn } from '@/utils/styles'

interface VirtualizedDivItemProps extends ComponentProps<'div'> {
  /**
   * The fixed height of the item.
   */
  itemSize: number

  /**
   * The position (index) of the item in the list.
   */
  position: number
}

/**
 * Displays a single list item in a virtualized div.
 *
 * Automatically sets its position and height.
 */
const VirtualizedDivItem = (props: VirtualizedDivItemProps) => {
  const { itemSize, position, ...divProps } = props

  return (
    <div
      {...propsWithCn(divProps, 'absolute top-0 left-0 w-full')}
      style={{
        transform: `translateY(${position}px)`,
        height: itemSize,
        ...divProps.style,
      }}
    />
  )
}

export { VirtualizedDivItem, type VirtualizedDivItemProps }
