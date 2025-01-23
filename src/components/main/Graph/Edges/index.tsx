import clsx from 'clsx'

import type { Element, ElementId } from '@main/SvgOverlay/context'
import { getPosition } from '@main/SvgOverlay/utils'

export const EDGE_OFFSET = 8
export const CURVE_SIZE = 22
export const CURVE_HANDLES_OFFSET = 15

export const BEGIN_PATH = (X_FROM: number, Y_FROM: number) =>
  `M ${X_FROM} ${Y_FROM}`
export const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
export const CURVE_RIGHT_UP = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES_OFFSET)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
export const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES_OFFSET}, ${CURVE_SIZE} ${CURVE_SIZE}`
export const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`
export const LINE_UP = (Y_FROM: number, Y_TO: number) => `l 0 ${Y_TO - Y_FROM}`
export const LINE_DOWN = (Y_FROM: number, Y_TO: number) =>
  `l 0 ${Y_TO - Y_FROM - 4 * CURVE_SIZE}`
export const LINE_RIGHT = (X_FROM: number, X_TO: number) =>
  `l ${X_TO - X_FROM - CURVE_SIZE * 2} 0`
export const HALF_LINE_RIGHT = (X_FROM: number, X_TO: number) =>
  `l ${(X_TO - X_FROM) / 2 - CURVE_SIZE * 2} 0`

interface EdgesProps {
  elements: Map<ElementId, Element>
}

const Edges = (props: EdgesProps) => {
  const { elements } = props

  return [...elements.entries()].map(([id, elem]) => {
    if (elem.ref.current && elem.parent) {
      const parentElem = elements.get(elem.parent)

      if (parentElem?.ref?.current) {
        const elemSize = elem.ref.current.clientHeight
        const parentSize = parentElem.ref.current.clientHeight
        const elemPos = getPosition(elem)
        const parentPos = getPosition(parentElem)

        // Anchor is center bottom
        const [elemX, elemY] = [
          elemPos.x + elemSize / 2,
          elemPos.y + elemSize + EDGE_OFFSET,
        ]
        // Anchor is center top
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
                          parentIsAbove ? CURVE_RIGHT_UP : CURVE_RIGHT_DOWN,
                          parentIsAbove
                            ? LINE_UP(elemY, parentY)
                            : LINE_DOWN(elemY, parentY),
                          parentIsAbove ? CURVE_UP_RIGHT : CURVE_DOWN_RIGHT,
                          HALF_LINE_RIGHT(elemX, parentX),
                        ]),
                    CURVE_RIGHT_DOWN,
                  ]),
            ].join(' ')}
          />
        )
      }
    }
  })
}

export { Edges, type EdgesProps }
