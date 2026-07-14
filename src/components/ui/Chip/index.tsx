import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Size, Status } from '@/utils/types'

type ChipStatus = Status | 'accent'

interface ChipProps extends ComponentProps<'div'> {
  /**
   * The size of the chip, which affects its padding and font size.
   */
  size?: Size

  /**
   * The status of the chip, which affects its color.
   */
  status?: ChipStatus

  /**
   * Whether the chip should be pill-shaped.
   */
  rounded?: boolean
}

/**
 * Small component used to display tags, labels, or statuses.
 */
const Chip = (props: ChipProps) => {
  const { size = 'md', status = 'neutral', rounded = true, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'w-max h-max text-nowrap flex-nowrap',
        'text-center shadow-xs shadow-black/20',
        rounded ? 'rounded-4xl' : 'rounded-xs',
        match(size)
          .with('xs', () => 'text-xs px-1.25 py-0.5')
          .with('sm', () => 'text-xs px-1.5 py-0.5')
          .with('md', () => 'text-sm px-1.75 py-0.75')
          .with('lg', () => 'text-sm px-2.5 py-1.5')
          .exhaustive(),
        match(status)
          .with('neutral', () => 'bg-light-950/15 text-light-500/90')
          .with('primary', () => 'bg-primary-600/30 text-primary-200/90')
          .with('accent', () => 'bg-accent-500/30 text-accent-300/90')
          .with('success', () => 'bg-success-400/30 text-success-200/90')
          .with('warning', () => 'bg-warning-300/30 text-warning-100/90')
          .with('danger', () => 'bg-danger-400/30 text-danger-200/90')
          .exhaustive(),
      )}
    />
  )
}

export { Chip, type ChipProps, type ChipStatus }
