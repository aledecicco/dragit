import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

import { SvgOverlayContextProvider, useSvgOverlay } from './context'
import { makeTracked } from './utils'

const EDGE_OFFSET = 8
const CURVE_SIZE = 22
const CURVE_HANDLES = 15

const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES}, ${CURVE_SIZE - CURVE_HANDLES} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
const CURVE_RIGHT_UP = `c ${CURVE_HANDLES} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES}, ${CURVE_SIZE} ${CURVE_SIZE}`
const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES}, ${CURVE_SIZE - CURVE_HANDLES} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`

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
              elemRef.offsetTop + elemRef.clientHeight + EDGE_OFFSET,
            ]
            const [parentX, parentY] = [
              parentRef.offsetLeft + parentRef.clientWidth / 2,
              parentRef.offsetTop - EDGE_OFFSET,
            ]

            const parentIsAbove = parentY <= elemY + CURVE_SIZE
            const parentIsLevel = Math.abs(parentY - elemY) <= CURVE_SIZE * 3

            return (
              <path
                key={id}
                className={clsx('fill-none stroke-primary-800 stroke-4')}
                d={
                  parentElem.branch === elem.branch
                    ? `M ${elemX} ${elemY} L ${parentX} ${parentY}`
                    : [
                        `M ${elemX} ${elemY}`,
                        CURVE_DOWN_RIGHT,
                        `l ${(parentX - elemX) / 2 - CURVE_SIZE} 0`,
                        ...(parentIsLevel
                          ? []
                          : [
                              parentIsAbove ? CURVE_RIGHT_UP : CURVE_RIGHT_DOWN,
                              parentIsAbove
                                ? `l 0 ${parentY - elemY}`
                                : `l 0 ${parentY - elemY - 4 * CURVE_SIZE}`,
                              parentIsAbove ? CURVE_UP_RIGHT : CURVE_DOWN_RIGHT,
                            ]),
                        parentIsLevel
                          ? `l ${(parentX - elemX) / 2 - CURVE_SIZE} 0`
                          : `l ${(parentX - elemX) / 2 - CURVE_SIZE * 3} 0`,
                        CURVE_RIGHT_DOWN,
                      ].join(' ')
                }
              />
            )
          }
        }
      })}
    </svg>
  )
}

export { SvgOverlay, type SvgOverlayProps, makeTracked, useSvgOverlay }
