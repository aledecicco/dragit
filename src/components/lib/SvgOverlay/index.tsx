import type { ComponentProps, ComponentType } from 'react'

import { cn, propsWithCn } from '@utils/styles'
import {
  SvgOverlayContextProvider,
  type SvgOverlayState,
  useSvgOverlay,
} from './context'
import { makeTracked } from './utils'

interface SvgOverlayProps extends ComponentProps<'div'> {
  RenderOverlay: ComponentType<Pick<SvgOverlayState, 'elements'>>
}

const SvgOverlay = (props: SvgOverlayProps) => {
  return (
    <SvgOverlayContextProvider>
      <SvgOverlayInner {...props} />
    </SvgOverlayContextProvider>
  )
}

const SvgOverlayInner = (props: SvgOverlayProps) => {
  const { children, RenderOverlay, ...divProps } = props
  const svgOverlay = useSvgOverlay()

  return (
    <div
      {...propsWithCn(
        divProps,

        'relative w-full h-full overflow-hidden',
      )}
    >
      {children}
      <svg
        ref={svgOverlay.svgRef}
        className={cn(
          'absolute left-0 top-0 w-full h-full',
          'pointer-events-none',
        )}
        role="img"
        aria-label="SVG Overlay"
      >
        <RenderOverlay elements={svgOverlay.elements} />
      </svg>
    </div>
  )
}

export { SvgOverlay, type SvgOverlayProps, makeTracked, useSvgOverlay }
