import clsx from 'clsx'
import type { ComponentProps, ComponentType } from 'react'

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
      {...divProps}
      className={clsx(
        'relative w-full h-full overflow-hidden',
        divProps.className,
      )}
    >
      {children}
      <svg
        ref={svgOverlay.svgRef}
        className={clsx(
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
