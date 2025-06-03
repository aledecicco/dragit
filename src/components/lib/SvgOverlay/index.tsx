import type { ComponentProps, ComponentType } from 'react'

import { cn, propsWithCn } from '@utils/styles'
import { mergeRefs } from 'react-merge-refs'
import {
  SvgOverlayContextProvider,
  type SvgOverlayState,
  useSvgOverlay,
} from './context'
import { makeTracked } from './utils'

interface SvgOverlayProps extends ComponentProps<'div'> {
  /**
   * Component constructor that will take care of rendering the SVG elements.
   */
  RenderOverlay: ComponentType<Pick<SvgOverlayState, 'elements'>>
}

const SvgOverlay = (props: SvgOverlayProps) => {
  return (
    <SvgOverlayContextProvider>
      <SvgOverlayInner {...props} />
    </SvgOverlayContextProvider>
  )
}

/**
 * Renders the given children with an SVG overlay.
 *
 * Takes a component that should take care of rendering the SVG elements based on the state.
 */
const SvgOverlayInner = (props: SvgOverlayProps) => {
  const { children, RenderOverlay, ...divProps } = props
  const svgOverlay = useSvgOverlay()

  return (
    <div
      {...propsWithCn(divProps, 'relative')}
      ref={mergeRefs([svgOverlay.componentRef, divProps.ref])}
    >
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

      {children}
    </div>
  )
}

export { SvgOverlay, type SvgOverlayProps, makeTracked, useSvgOverlay }
