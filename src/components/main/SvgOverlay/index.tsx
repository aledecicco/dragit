import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

import { SvgOverlayContextProvider, useSvgOverlay } from './context'
import { makeTracked } from './utils'

const EDGE_OFFSET = 8
const CURVE_SIZE = 22
const CURVE_HANDLES = 15

const BEGIN_PATH = (X_FROM: number, Y_FROM: number) => `M ${X_FROM} ${Y_FROM}`
const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES}, ${CURVE_SIZE - CURVE_HANDLES} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
const CURVE_RIGHT_UP = `c ${CURVE_HANDLES} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES}, ${CURVE_SIZE} ${CURVE_SIZE}`
const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES}, ${CURVE_SIZE - CURVE_HANDLES} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`
const LINE_UP = (Y_FROM: number, Y_TO: number) => `l 0 ${Y_TO - Y_FROM}`
const LINE_DOWN = (Y_FROM: number, Y_TO: number) =>
  `l 0 ${Y_TO - Y_FROM - 4 * CURVE_SIZE}`
const LINE_RIGHT = (X_FROM: number, X_TO: number) =>
  `l ${X_TO - X_FROM - CURVE_SIZE * 2} 0`
const HALF_LINE_RIGHT = (X_FROM: number, X_TO: number) =>
  `l ${(X_TO - X_FROM) / 2 - CURVE_SIZE * 2} 0`

interface SvgOverlayProps extends PropsWithChildren {}

const SvgOverlay = (props: SvgOverlayProps) => {
  return (
    <SvgOverlayContextProvider>
      <SvgOverlayInner {...props} />
    </SvgOverlayContextProvider>
  )
}

const SvgOverlayInner = (props: SvgOverlayProps) => {
  const { children } = props
  const svgOverlay = useSvgOverlay()

  return (
    <div className={clsx('relative w-full h-full')}>
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
        {[...svgOverlay.elements.entries()].map(([id, elem]) => {
          if (elem.ref.current && elem.parent) {
            const parentElem = svgOverlay.elements.get(elem.parent)

            if (parentElem?.ref?.current) {
              const elemRef = elem.ref.current
              const parentRef = parentElem.ref.current

              const [elemX, elemY] = [
                elemRef.offsetLeft + elemRef.clientWidth / 2,
                elemRef.offsetTop + elemRef.clientHeight + EDGE_OFFSET,
              ]
              const [parentX, parentY] = [
                parentRef.offsetLeft + parentRef.clientWidth / 2,
                parentRef.offsetTop - EDGE_OFFSET,
              ]

              const parentIsAbove = parentY <= elemY + CURVE_SIZE // The top of the parent is above the bottom of the element
              const parentIsLevel = Math.abs(parentY - elemY) <= CURVE_SIZE * 3 // The top of the parent is aligned with the bottom of the element

              return (
                <path
                  key={id}
                  className={clsx('fill-none stroke-primary-800 stroke-4')}
                  d={[
                    BEGIN_PATH(elemX, elemY),
                    ...(parentElem.branch === elem.branch
                      ? [`L ${parentX} ${parentY}`]
                      : [
                          CURVE_DOWN_RIGHT,
                          ...(parentIsLevel
                            ? [LINE_RIGHT(elemX, parentX)]
                            : [
                                HALF_LINE_RIGHT(elemX, parentX),
                                parentIsAbove
                                  ? CURVE_RIGHT_UP
                                  : CURVE_RIGHT_DOWN,
                                parentIsAbove
                                  ? LINE_UP(elemY, parentY)
                                  : LINE_DOWN(elemY, parentY),
                                parentIsAbove
                                  ? CURVE_UP_RIGHT
                                  : CURVE_DOWN_RIGHT,
                                HALF_LINE_RIGHT(elemX, parentX),
                              ]),
                          CURVE_RIGHT_DOWN,
                        ]),
                  ].join(' ')}
                />
              )
            }
          }
        })}
      </svg>
    </div>
  )
}

export { SvgOverlay, type SvgOverlayProps, makeTracked, useSvgOverlay }
