import type { ComponentProps } from 'react'

import { Edges } from '@/layout/widgets/Graph/Edges'

import { cn, propsWithCn } from '@/utils/styles'

interface SvgOverlayProps extends ComponentProps<'div'> {}

/**
 * Renders the given children with an SVG overlay to join commits with edges.
 */
const SvgOverlay = (props: SvgOverlayProps) => {
  const { children, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'relative')}>
      <svg
        className={cn(
          'absolute left-0 top-0 w-full h-full',
          'pointer-events-none',
        )}
        role="img"
        aria-label="SVG Overlay"
      >
        <Edges />
      </svg>

      {children}
    </div>
  )
}

export { SvgOverlay, type SvgOverlayProps }
