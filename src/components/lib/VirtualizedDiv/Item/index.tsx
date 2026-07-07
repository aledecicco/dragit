import { type ComponentProps, useLayoutEffect, useRef } from 'react'
import { animate } from 'animejs'

import { FADE_IN_ANIMATION } from '@/utils/animation'
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

  /**
   * Whether to animate the item in when it mounts.
   */
  isNew?: boolean
}

/**
 * Displays a single list item in a virtualized div.
 *
 * Automatically sets its position and height.
 */
const VirtualizedDivItem = (props: VirtualizedDivItemProps) => {
  const { itemSize, position, isNew, ...divProps } = props

  const divRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (isNew && divRef.current) {
      divRef.current.style.opacity = '0'
      animate(divRef.current, FADE_IN_ANIMATION)
    }
  }, [isNew])

  return (
    <div
      ref={divRef}
      {...propsWithCn(
        divProps,
        'absolute top-0 left-0 w-full',
        'transition-transform duration-300 ease-out',
      )}
      style={{
        transform: `translateY(${position}px)`,
        height: itemSize,
        ...divProps.style,
      }}
    />
  )
}

export { VirtualizedDivItem, type VirtualizedDivItemProps }
