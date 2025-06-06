import { useMemo } from 'react'
import { match } from 'ts-pattern'

import type { Element, ElementId } from '@lib/SvgOverlay/context'
import { type Position, getPosition } from '@lib/SvgOverlay/utils'
import { cn } from '@utils/styles'
import { NODE_SIZE } from '../Commit/Node'

export type ParentCommitType = 'solid' | 'dashed' | 'unconfirmed'

/**
 * The space between a node and the edges that connect to it.
 */
export const EDGE_OFFSET = 8
/**
 * The radius of the curves used to change directions.
 */
export const CURVE_SIZE = 22
/**
 * Distance of the handles of the bezier curves.
 */
export const CURVE_HANDLES_OFFSET = 15
/**
 * The length of a simple edge that connects two nodes directly.
 */
export const EDGE_LENGTH = CURVE_SIZE * 4 + EDGE_OFFSET * 2
/**
 * The length of the short segments that are used to add padding to the paths.
 */
export const SHORT_LINE_LENGTH = CURVE_SIZE / 2

/**
 * The SVG path command to begin a path at a specific point.
 *
 * @param X_FROM - The X coordinate to start the path from.
 * @param Y_FROM - The Y coordinate to start the path from.
 */
export const BEGIN_PATH = (X_FROM: number, Y_FROM: number) =>
  `M ${X_FROM} ${Y_FROM}`

/**
 * The SVG path command to end a path at a specific point.
 *
 * @param X_TO - The X coordinate to end the path at.
 * @param Y_TO - The Y coordinate to end the path at.
 */
export const END_PATH = (X_TO: number, Y_TO: number) => `L ${X_TO} ${Y_TO}`

/**
 * A curve that starts going down and turns right.
 */
export const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
/**
 * A curve that starts going right and turns upward.
 */
export const CURVE_RIGHT_UP = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES_OFFSET)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
/**
 * A curve that starts going right and turns downward.
 */
export const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES_OFFSET}, ${CURVE_SIZE} ${CURVE_SIZE}`
/**
 * A curve that starts going up and turns right.
 */
export const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`
/**
 * A short padding line that goes down.
 */
export const SHORT_LINE_DOWN = `l 0 ${SHORT_LINE_LENGTH}`
/**
 * A short padding line that goes up.
 */
export const SHORT_LINE_UP = `l 0 ${-SHORT_LINE_LENGTH}`

/**
 * An arbitrary-length vertical line.
 *
 * @param Y_DELTA - The length of the line.
 */
export const VERTICAL_LINE = (Y_DELTA: number) => `l 0 ${Y_DELTA}`
/**
 * An arbitrary-length horizontal line.
 * @param X_DELTA - The length of the line.
 */
export const HORIZONTAL_LINE = (X_DELTA: number) => `l ${X_DELTA} 0`

/**
 * Combination of SVG path commands to connect two nodes where the parent is in a different branch,
 * and their anchors are aligned horizontally.
 *
 * @param X_DELTA - The horizontal distance between the two nodes.
 *
 * @example
 * ```
 * o
 * |____
 *      |
 *      o
 * ```
 */
export const TO_LEVEL_PARENT = (X_DELTA: number) =>
  `${SHORT_LINE_DOWN} ${CURVE_DOWN_RIGHT} ${HORIZONTAL_LINE(Math.abs(X_DELTA) - CURVE_SIZE * 2)} ${CURVE_RIGHT_DOWN}`

/**
 * Combination of SVG path commands to begin moving from a node to its parent,
 * stopping before having to turn upward or downward.
 *
 * @param X_DELTA - The horizontal distance between the two nodes.
 *
 * @example
 * ```
 * o
 * |__...
 * ```
 */
export const LEAVE_ELEMENT = (X_DELTA: number) =>
  `${SHORT_LINE_DOWN} ${CURVE_DOWN_RIGHT} ${HORIZONTAL_LINE(Math.abs(X_DELTA) * 0.7 - CURVE_SIZE * 2)}`

/**
 * Combination of SVG path commands to end moving from a node to its parent,
 * starting right after turning right.
 *
 * @param X_DELTA - The horizontal distance between the two nodes.
 *
 * @example
 * ```
 * ...__
 *      |
 *      o
 * ```
 */
export const ENTER_PARENT = (X_DELTA: number) =>
  `${HORIZONTAL_LINE(Math.abs(X_DELTA) * 0.3 - CURVE_SIZE * 2)} ${CURVE_RIGHT_DOWN}`

/**
 * Combination of SVG path commands to move from a node to its parent,
 * where the parent is below the element.
 * Starts after leaving the element and ends before entering the parent.
 *
 * @param Y_DELTA - The vertical distance between the two nodes.
 *
 * @example
 * ```
 * ..._
 *     |
 *     |
 *     |_...
 * ```
 */
export const DOWN_TO_PARENT = (Y_DELTA: number) =>
  `${CURVE_RIGHT_DOWN} ${VERTICAL_LINE(Math.abs(Y_DELTA) - CURVE_SIZE * 4 - SHORT_LINE_LENGTH)} ${CURVE_DOWN_RIGHT}`

/**
 * Combination of SVG path commands to move from a node to its parent,
 * where the parent is above the element.
 * Starts after leaving the element and ends before entering the parent.
 *
 * @param Y_DELTA - The vertical distance between the two nodes.
 *
 * @example
 * ```
 *      _...
 *     |
 *     |
 * ..._|
 * ```
 */
export const UP_TO_PARENT = (Y_DELTA: number) =>
  `${CURVE_RIGHT_UP} ${SHORT_LINE_UP} ${VERTICAL_LINE(-Math.abs(Y_DELTA))} ${CURVE_UP_RIGHT}`

interface EdgesProps {
  /**
   * The map of registered nodes and their relationships.
   */
  elements: Map<ElementId, Element<ParentCommitType>>
}

/**
 * Implementation of the SVG overlay renderer that draws edges between a commit and its parent.
 *
 * Edges can have different styles, represented by {@link ParentCommitType}.
 */
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

/**
 * Builds the SVG path commands to connect two elements at the given positions.
 *
 * @param elemPos - The position of the element to connect from.
 * @param parentPos - The position of the parent element to connect to.
 *
 * @returns An array of SVG path segments that describes the edge needed to join both nodes.
 */
const buildPath = (elemPos: Position, parentPos: Position): string[] => {
  // The top of the parent is above the bottom of the element.
  const parentIsAbove = parentPos.y < elemPos.y

  // The top of the parent is aligned with the bottom of the element.
  const parentIsLevel =
    Math.abs(elemPos.y + EDGE_LENGTH - parentPos.y) <= CURVE_SIZE

  // The parent is directly below the element.
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
