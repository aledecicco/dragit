import type { ComponentProps } from 'react'

import { cn, propsWithCn } from '@utils/styles'

interface ScrollShadowDivProps extends ComponentProps<'div'> {
  isScrolled: boolean
  hasScrollLeft: boolean
}

const ScrollShadowDiv = (props: ScrollShadowDivProps) => {
  const { isScrolled, hasScrollLeft, children, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'relative')}>
      {children}

      <div
        className={cn(
          'w-full h-4 absolute top-0 left-0',
          'opacity-0 bg-linear-to-b from-dark-950/70 to-[transparent] rounded-b-full',
          isScrolled ? 'animate-fade-in' : 'animate-fade-out',
          'pointer-events-none',
        )}
        aria-hidden={true}
      />

      <div
        className={cn(
          'w-full h-4 absolute bottom-0 left-0',
          'opacity-0 bg-linear-to-t from-dark-950/70 to-[transparent] rounded-t-full',
          hasScrollLeft ? 'animate-fade-in' : 'animate-fade-out',
          'pointer-events-none',
        )}
        aria-hidden={true}
      />
    </div>
  )
}

export { ScrollShadowDiv, type ScrollShadowDivProps }
