import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'

type SkeletonVariant = 'line' | 'fill'

interface SkeletonProps extends ComponentProps<'div'> {
  variant?: SkeletonVariant
}

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
