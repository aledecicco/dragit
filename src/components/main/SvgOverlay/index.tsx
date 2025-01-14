import clsx from 'clsx'
import type { HTMLProps } from 'react'

import { SvgOverlayContextProvider, useSvgOverlay } from './context'
import {
  BEGIN_PATH,
  CURVE_DOWN_RIGHT,
  CURVE_RIGHT_DOWN,
  CURVE_RIGHT_UP,
  CURVE_SIZE,
  CURVE_UP_RIGHT,
  EDGE_OFFSET,
  HALF_LINE_RIGHT,
  LINE_DOWN,
  LINE_RIGHT,
  LINE_UP,
  getPosition,
  makeTracked,
} from './utils'

interface SvgOverlayProps extends HTMLProps<HTMLDivElement> {}

const SvgOverlay = (props: SvgOverlayProps) => {
  return (
    <SvgOverlayContextProvider>
      <SvgOverlayInner {...props} />
    </SvgOverlayContextProvider>
  )
}

const SvgOverlayInner = (props: SvgOverlayProps) => {
  const { children, ...divProps } = props
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
        {[...svgOverlay.elements.entries()].map(([id, elem]) => {
          if (elem.ref.current && elem.parent) {
            const parentElem = svgOverlay.elements.get(elem.parent)

            if (parentElem?.ref?.current) {
              const elemSize = elem.ref.current.clientHeight
              const parentSize = parentElem.ref.current.clientHeight
              const elemPos = getPosition(elem)
              const parentPos = getPosition(parentElem)

              const [elemX, elemY] = [
                elemPos.x + elemSize / 2,
                elemPos.y + elemSize + EDGE_OFFSET,
              ]
              const [parentX, parentY] = [
                parentPos.x + parentSize / 2,
                parentPos.y - EDGE_OFFSET,
              ]

              const parentIsAbove = parentY <= elemY + CURVE_SIZE // The top of the parent is above the bottom of the element
              const parentIsLevel = Math.abs(parentY - elemY) <= CURVE_SIZE * 3 // The top of the parent is aligned with the bottom of the element
              const parentIsAligned = parentX === elemX // The parent is directly below the element

              return (
                <path
                  key={id}
                  className={clsx('fill-none stroke-primary-800 stroke-4')}
                  d={[
                    BEGIN_PATH(elemX, elemY),
                    ...(parentIsAligned
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
