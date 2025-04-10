import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface ChipProps extends ComponentProps<'div'> {
  size?: Size
}

const Chip = (props: ChipProps) => {
  const { size = 'md', ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'w-max h-max text-nowrap flex-nowrap',
        'p-1 text-center rounded-4xl',
        'shadow-xs bg-dark-50 text-light-500',
        match(size)
          .with('sm', () => 'text-xs px-1.5 py-0.5')
          .with('md', () => 'text-xs px-2 py-1')
          .with('lg', () => 'text-sm px-2.5 py-1.5')
          .exhaustive(),
      )}
    />
  )
}

export { Chip, type ChipProps }
