import { type ComponentProps, useEffect, useRef, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'

import { Edges } from '@/layout/widgets/Graph/Edges'

import { cn, propsWithCn } from '@/utils/styles'

import { graphAnimator } from './animation'

interface SvgOverlayProps extends ComponentProps<'div'> {}

/**
 * Renders the given children with an SVG overlay to join commits with edges.
 */
const SvgOverlay = (props: SvgOverlayProps) => {
  const { children, ...divProps } = props

  const containerRef = useRef<HTMLDivElement>(null)

  const [observer] = useState(
    () =>
      new ResizeObserver(() => {
        graphAnimator.redrawAllEdges()
      }),
  )

  useEffect(() => {
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [observer])

  return (
    <div
      {...propsWithCn(divProps, 'relative')}
      ref={mergeRefs([containerRef, divProps.ref])}
    >
      <svg
        className={cn('absolute left-0 top-0 size-full', 'pointer-events-none')}
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
