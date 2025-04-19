import { useMemo } from 'react'
import { match } from 'ts-pattern'

import type { Element, ElementId } from '@lib/SvgOverlay/context'
import { type Position, getPosition } from '@lib/SvgOverlay/utils'
import { cn } from '@utils/styles'
import { NODE_SIZE } from '../Commit'

export type ParentCommitType = 'solid' | 'dashed' | 'unconfirmed'

export const EDGE_OFFSET = 8
export const CURVE_SIZE = 22
export const CURVE_HANDLES_OFFSET = 15
export const EDGE_LENGTH = CURVE_SIZE * 4 + EDGE_OFFSET * 2
export const SHORT_LINE_LENGTH = CURVE_SIZE / 2

export const BEGIN_PATH = (X_FROM: number, Y_FROM: number) =>
  `M ${X_FROM} ${Y_FROM}`
export const END_PATH = (X_TO: number, Y_TO: number) => `L ${X_TO} ${Y_TO}`

export const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
export const CURVE_RIGHT_UP = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES_OFFSET)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
export const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES_OFFSET}, ${CURVE_SIZE} ${CURVE_SIZE}`
export const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`
export const SHORT_LINE_DOWN = `l 0 ${SHORT_LINE_LENGTH}`
export const SHORT_LINE_UP = `l 0 ${-SHORT_LINE_LENGTH}`

export const VERTICAL_LINE = (Y_DELTA: number) => `l 0 ${Y_DELTA}`
export const HORIZONTAL_LINE = (X_DELTA: number) => `l ${X_DELTA} 0`

export const TO_LEVEL_PARENT = (X_DELTA: number) =>
  `${SHORT_LINE_DOWN} ${CURVE_DOWN_RIGHT} ${HORIZONTAL_LINE(Math.abs(X_DELTA) - CURVE_SIZE * 2)} ${CURVE_RIGHT_DOWN}`
export const LEAVE_ELEMENT = (X_DELTA: number) =>
  `${SHORT_LINE_DOWN} ${CURVE_DOWN_RIGHT} ${HORIZONTAL_LINE(Math.abs(X_DELTA) * 0.7 - CURVE_SIZE * 2)}`
export const ENTER_PARENT = (X_DELTA: number) =>
  `${HORIZONTAL_LINE(Math.abs(X_DELTA) * 0.3 - CURVE_SIZE * 2)} ${CURVE_RIGHT_DOWN}`

export const DOWN_TO_PARENT = (Y_DELTA: number) =>
  `${CURVE_RIGHT_DOWN} ${VERTICAL_LINE(Math.abs(Y_DELTA) - CURVE_SIZE * 4 - SHORT_LINE_LENGTH)} ${CURVE_DOWN_RIGHT}`
export const UP_TO_PARENT = (Y_DELTA: number) =>
  `${CURVE_RIGHT_UP} ${SHORT_LINE_UP} ${VERTICAL_LINE(-Math.abs(Y_DELTA))} ${CURVE_UP_RIGHT}`

interface EdgesProps {
  elements: Map<ElementId, Element<ParentCommitType>>
}

const Edges = (props: EdgesProps) => {
  const { elements } = props

  const edges = useMemo(() => {
    return [...elements.entries()].map(([id, elem]) => {
      if (elem.ref.current && elem.parent) {
        const parentElem = elements.get(elem.parent.id)

        if (parentElem?.ref?.current) {
          const elemPos = getPosition(elem)
          const parentPos = getPosition(parentElem)

          // Anchor is center bottom
          elemPos.x += NODE_SIZE / 2
          elemPos.y += NODE_SIZE + EDGE_OFFSET

          // Anchor is center top
          parentPos.x += NODE_SIZE / 2
          parentPos.y -= EDGE_OFFSET

          const path = buildPath(elemPos, parentPos).join(' ')

          return (
            <path
              key={id}
              className={cn(
                'fill-none stroke-4',
                match(elem.parent.type)
                  .with('solid', () => 'stroke-primary-600')
                  .with('dashed', () => 'stroke-primary-600')
                  .with('unconfirmed', () => 'stroke-accent-400')
                  .otherwise(() => undefined),
                elem.parent.type === 'dashed' && '[stroke-dasharray:8_5]',
              )}
              d={path}
            />
          )
        }
      }
    })
  }, [elements])

  return edges
}

const buildPath = (elemPos: Position, parentPos: Position): string[] => {
  // The top of the parent is above the bottom of the element
  const parentIsAbove = parentPos.y < elemPos.y
  // The top of the parent is aligned with the bottom of the element
  const parentIsLevel =
    Math.abs(elemPos.y + EDGE_LENGTH - parentPos.y) <= CURVE_SIZE
  // The parent is directly below the element
  const parentIsAligned = Math.abs(parentPos.x - elemPos.x) <= CURVE_SIZE

  const path = [BEGIN_PATH(elemPos.x, elemPos.y)]

  if (!parentIsAligned) {
    if (parentIsLevel) {
      path.push(TO_LEVEL_PARENT(parentPos.x - elemPos.x))
    } else {
      path.push(LEAVE_ELEMENT(parentPos.x - elemPos.x))
      if (parentIsAbove) {
        path.push(UP_TO_PARENT(parentPos.y - elemPos.y))
      } else {
        path.push(DOWN_TO_PARENT(parentPos.y - elemPos.y))
      }
      path.push(ENTER_PARENT(parentPos.x - elemPos.x))
    }
  }

  path.push(END_PATH(parentPos.x, parentPos.y))

  return path
}

export { Edges, type EdgesProps }
