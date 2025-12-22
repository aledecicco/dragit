import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

interface ChipProps extends ComponentProps<'div'> {
  /**
   * The size of the chip, which affects its padding and font size.
   */
  size?: Size
}

/**
 * Small rounded component used to display tags or labels.
 */
const Chip = (props: ChipProps) => {
  const { size = 'md', ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'w-max h-max text-nowrap flex-nowrap',
        'text-center rounded-4xl',
        'shadow-xs bg-dark-50 text-light-500',
        match(size)
          .with('xs', () => 'text-xs px-1.25 py-0.5')
          .with('sm', () => 'text-xs px-1.5 py-0.5')
          .with('md', () => 'text-sm px-1.75 py-0.75')
          .with('lg', () => 'text-sm px-2.5 py-1.5')
          .exhaustive(),
      )}
    />
  )
}

export { Chip, type ChipProps }
