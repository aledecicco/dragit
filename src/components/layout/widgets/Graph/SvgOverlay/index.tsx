import { type ComponentProps, useEffect, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'

import { Edges } from '@/layout/widgets/Graph/Edges'

import { cn, propsWithCn } from '@/utils/styles'

import { useRefreshCanvas } from './utils'

interface SvgOverlayProps extends ComponentProps<'div'> {}

/**
 * Renders the given children with an SVG overlay to join commits with edges.
 */
const SvgOverlay = (props: SvgOverlayProps) => {
  const { children, ...divProps } = props

  const ref = useRef<HTMLDivElement>(null)

  const observer = useRef<ResizeObserver | null>(null)
  const { refresh, refreshTrigger } = useRefreshCanvas()

  useEffect(() => {
    observer.current = new ResizeObserver(refresh)
    const element = ref.current

    if (element) {
      observer.current.observe(element)
    }

    return () => {
      if (element) {
        observer.current?.disconnect()
      }
    }
  }, [refresh])

  return (
    <div
      {...propsWithCn(divProps, 'relative')}
      ref={mergeRefs([ref, divProps.ref])}
    >
      <svg
        key={refreshTrigger}
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
