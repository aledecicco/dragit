import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'

interface SkeletonProps extends ComponentProps<'div'> {
  variant?: 'fill'
}

const Skeleton = (props: SkeletonProps) => {
  const { variant, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'animate-pulse bg-dark-400',
        'flex flex-col items-center justify-center text-center text-sm text-light-950',
        'rounded-xs',
        match(variant)
          .with('fill', () => 'w-full h-full')
          .otherwise(() => undefined),
      )}
    />
  )
}

export { Skeleton, type SkeletonProps }
