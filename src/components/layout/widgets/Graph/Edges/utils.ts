import type { Position } from '@/layout/widgets/Graph/SvgOverlay/utils'

import { NODE_SIZE } from '../Commit/Node'

/**
 * Offsets the raw positions of two connected elements to the anchor points used by edges.
 *
 * @param elemPos - The raw position of the element to connect from.
 * @param parentPos - The raw position of the parent element to connect to.
 *
 * @returns The anchored positions as a `[elemPos, parentPos]` tuple.
 */
export const getEdgeAnchors = (
  elemPos: Position,
  parentPos: Position,
): [Position, Position] => [
  { x: elemPos.x + NODE_SIZE / 2, y: elemPos.y + NODE_SIZE + EDGE_OFFSET },
  { x: parentPos.x + NODE_SIZE / 2, y: parentPos.y - EDGE_OFFSET },
]

/**
 * Builds the SVG path commands to connect two elements at the given positions.
 *
 * @param elemPos - The position of the element to connect from.
 * @param parentPos - The position of the parent element to connect to.
 *
 * @returns An array of SVG path segments that describes the edge needed to join both nodes.
 */
export const buildPath = (elemPos: Position, parentPos: Position): string[] => {
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
const BEGIN_PATH = (X_FROM: number, Y_FROM: number) => `M ${X_FROM} ${Y_FROM}`

/**
 * The SVG path command to end a path at a specific point.
 *
 * @param X_TO - The X coordinate to end the path at.
 * @param Y_TO - The Y coordinate to end the path at.
 */
const END_PATH = (X_TO: number, Y_TO: number) => `L ${X_TO} ${Y_TO}`

/**
 * A curve that starts going down and turns right.
 */
const CURVE_DOWN_RIGHT = `c 0 ${CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${CURVE_SIZE}, ${CURVE_SIZE} ${CURVE_SIZE}`
/**
 * A curve that starts going right and turns upward.
 */
const CURVE_RIGHT_UP = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${-(CURVE_SIZE - CURVE_HANDLES_OFFSET)}, ${CURVE_SIZE} ${-CURVE_SIZE}`
/**
 * A curve that starts going right and turns downward.
 */
const CURVE_RIGHT_DOWN = `c ${CURVE_HANDLES_OFFSET} 0, ${CURVE_SIZE} ${CURVE_SIZE - CURVE_HANDLES_OFFSET}, ${CURVE_SIZE} ${CURVE_SIZE}`
/**
 * A curve that starts going up and turns right.
 */
const CURVE_UP_RIGHT = `c 0 ${-CURVE_HANDLES_OFFSET}, ${CURVE_SIZE - CURVE_HANDLES_OFFSET} ${-CURVE_SIZE}, ${CURVE_SIZE} ${-CURVE_SIZE}`
/**
 * A short padding line that goes down.
 */
const SHORT_LINE_DOWN = `l 0 ${SHORT_LINE_LENGTH}`
/**
 * A short padding line that goes up.
 */
const SHORT_LINE_UP = `l 0 ${-SHORT_LINE_LENGTH}`

/**
 * An arbitrary-length vertical line.
 *
 * @param Y_DELTA - The length of the line.
 */
const VERTICAL_LINE = (Y_DELTA: number) => `l 0 ${Y_DELTA}`
/**
 * An arbitrary-length horizontal line.
 * @param X_DELTA - The length of the line.
 */
const HORIZONTAL_LINE = (X_DELTA: number) => `l ${X_DELTA} 0`

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
const TO_LEVEL_PARENT = (X_DELTA: number) =>
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
const LEAVE_ELEMENT = (X_DELTA: number) =>
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
const ENTER_PARENT = (X_DELTA: number) =>
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
const DOWN_TO_PARENT = (Y_DELTA: number) =>
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
const UP_TO_PARENT = (Y_DELTA: number) =>
  `${CURVE_RIGHT_UP} ${SHORT_LINE_UP} ${VERTICAL_LINE(-Math.abs(Y_DELTA))} ${CURVE_UP_RIGHT}`
