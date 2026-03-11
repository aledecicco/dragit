import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { cn, propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

interface ScrollShadowDivProps extends ComponentProps<'div'> {
  /**
   * Whether the div has been scrolled down.
   * If true, the top shadow is displayed.
   */
  isScrolled: boolean

  /**
   * Whether the div has can be scrolled down.
   * If true, the bottom shadow is displayed.
   */
  hasScrollLeft: boolean

  /**
   * The size of the shadows.
   */
  size?: Size
}

/**
 * Div that displays shadows at the top and bottom to signal scrollable content.
 */
const ScrollShadowDiv = (props: ScrollShadowDivProps) => {
  const {
    isScrolled,
    hasScrollLeft,
    size = 'md',
    children,
    ...divProps
  } = props

  return (
    <div {...propsWithCn(divProps, 'relative overflow-y-hidden max-h-full')}>
      {children}

      <div
        className={cn(
          'w-full absolute -top-1 left-0',
          'opacity-0 bg-linear-to-b from-dark-950/80 to-transparent from-30% rounded-b-full',
          match(size)
            .with('xs', () => 'h-2.25 from-dark-950/70')
            .with('sm', () => 'h-2.5 from-dark-950/70')
            .with('md', () => 'h-3')
            .with('lg', () => 'h-4')
            .exhaustive(),
          isScrolled ? 'animate-fade-in' : 'animate-fade-out',
          'pointer-events-none',
        )}
      />

      <div
        className={cn(
          'w-full absolute -bottom-1 left-0',
          'opacity-0 bg-linear-to-t from-dark-950/80 to-transparent from-30% rounded-t-full',
          match(size)
            .with('xs', () => 'h-2.25 from-dark-950/70')
            .with('sm', () => 'h-2.5 from-dark-950/70')
            .with('md', () => 'h-3')
            .with('lg', () => 'h-4')
            .exhaustive(),
          hasScrollLeft ? 'animate-fade-in' : 'animate-fade-out',
          'pointer-events-none',
        )}
      />
    </div>
  )
}

export { ScrollShadowDiv, type ScrollShadowDivProps }
