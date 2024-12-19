import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

import { SvgOverlayContextProvider, useSvgOverlay } from './context'
import { makeTracked } from './utils'

const EDGE_OFFSET = 5

interface SvgOverlayProps extends PropsWithChildren {}

const SvgOverlay = (props: SvgOverlayProps) => {
  const { children } = props

  return (
    <SvgOverlayContextProvider>
      <div className={clsx('relative w-max h-max')}>
        {children}
        <SvgOverlayInner />
      </div>
    </SvgOverlayContextProvider>
  )
}

const SvgOverlayInner = () => {
  const svgOverlay = useSvgOverlay()

  return (
    <svg
      className={clsx(
        'absolute left-0 top-0 w-full h-full',
        'pointer-events-none',
      )}
      role="img"
      aria-label="SVG Overlay"
    >
      {[...svgOverlay.elements.entries()].map(([id, elem]) => {
        if (elem.ref.current && elem.parent) {
          const parentElem = svgOverlay.elements.get(elem.parent)

          if (parentElem?.ref?.current) {
            const elemRef = elem.ref.current
            const parentRef = parentElem.ref.current
            const [elemX, elemY] = [
              elemRef.offsetLeft + elemRef.clientWidth / 2,
              elemRef.offsetTop + elemRef.clientHeight,
            ]
            const [parentX, parentY] = [
              parentRef.offsetLeft + parentRef.clientWidth / 2,
              parentRef.offsetTop,
            ]

            return (
              <path
                className={clsx('fill-none stroke-primary-800 stroke-4')}
                d={[
                  `M ${elemX} ${elemY + EDGE_OFFSET}`,
                  `C ${elemX - 50} ${elemY - 50}, ${parentX - 50} ${parentY - 50}, ${parentX} ${parentY - EDGE_OFFSET}`,
                ].join(' ')}
              />
            )
          }
        }
      })}
    </svg>
  )
}

export { SvgOverlay, type SvgOverlayProps, makeTracked, useSvgOverlay }
