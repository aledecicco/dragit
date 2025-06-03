import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'

type SkeletonVariant = 'line' | 'fill'

interface SkeletonProps extends ComponentProps<'div'> {
  /**
   * The type of skeleton to display.
   *
   * If 'fill', it will cover all space available.
   * If 'line', it will be a horizontal line with a random width.
   */
  variant?: SkeletonVariant
}

/**
 * A visual indicator of a loading state.
 */
const Skeleton = (props: SkeletonProps) => {
  const { variant = 'fill', ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'animate-pulse bg-dark-400 rounded-xs',
        match(variant)
          .with('fill', () => 'w-full h-full')
          .with('line', () => 'h-3')
          .exhaustive(),
      )}
      style={{
        ...divProps.style,
        width:
          variant === 'line'
            ? `${50 + Math.floor(Math.random() * 5) * 8}%`
            : undefined,
      }}
    />
  )
}

export { Skeleton, type SkeletonProps }
