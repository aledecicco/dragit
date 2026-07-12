import { animate, type JSAnimation, utils } from 'animejs'

import { buildPath, getEdgeAnchors } from '@/layout/widgets/Graph/Edges/utils'

import { type ElementId, useSvgTrackerStore } from './store'
import { getPosition } from './utils'

interface NodeAnimation {
  /**
   * The vertical offset the node is currently rendered at.
   */
  currentY: number

  /**
   * The vertical offset the node should settle at.
   */
  targetY: number
}

/**
 * A node mid-flight, tracking where it started and where it's headed.
 */
interface UpdateEntry {
  id: ElementId
  node: NodeAnimation
  from: number
  to: number
}

/**
 * Builds the imperative animation controller for the commit graph.
 *
 * Deliberately avoids React state to keep per-frame updates smooth.
 *
 * The app only declares where a node should be via {@link setNodeTarget},
 * and the controller keeps nodes and edges in agreement within each frame.
 */
const createGraphAnimator = () => {
  /**
   * Vertical position state for every tracked node, keyed by element id.
   */
  const nodeAnimations = new Map<ElementId, NodeAnimation>()

  /**
   * The paths of all edges, keyed by the id of the node they point to.
   */
  const edgePaths = new Map<ElementId, SVGPathElement>()

  let updateScheduled = false
  let currentAnimation: JSAnimation | undefined
  let currentBatch: UpdateEntry[] = []
  const progress = { value: 0 }

  const getTrackedElements = () => useSvgTrackerStore.getState().elements

  /**
   * Imperatively sets the vertical offset of a node in the DOM.
   */
  const placeNode = (id: ElementId, node: NodeAnimation) => {
    const elem = getTrackedElements().get(id)?.ref.current
    if (elem) {
      elem.style.transform = `translateY(${node.currentY}px)`
    }
  }

  /**
   * Imperatively rebuilds and updates the path of every edge touching one of the given nodes.
   */
  const redrawEdges = (affectedNodes: Set<ElementId>) => {
    const elements = getTrackedElements()

    for (const [childId, path] of edgePaths) {
      const elem = elements.get(childId)
      if (!elem?.parent || !elem.ref.current) {
        continue
      }

      if (!affectedNodes.has(childId) && !affectedNodes.has(elem.parent.id)) {
        continue
      }

      const parentElem = elements.get(elem.parent.id)
      if (!parentElem?.ref.current) {
        continue
      }

      const [elemPos, parentPos] = getEdgeAnchors(
        getPosition(elem),
        getPosition(parentElem),
      )

      path.setAttribute('d', buildPath(elemPos, parentPos).join(' '))
    }
  }

  /**
   * Runs once per frame, moving nodes and then updating edges.
   */
  const onFrame = () => {
    const movedNodes = new Set<ElementId>()

    for (const update of currentBatch) {
      if (nodeAnimations.get(update.id) !== update.node) {
        continue
      }

      update.node.currentY = utils.lerp(update.from, update.to, progress.value)
      placeNode(update.id, update.node)
      movedNodes.add(update.id)
    }

    redrawEdges(movedNodes)
  }

  /**
   * Begins moving nodes towards their new destinations.
   */
  const startUpdate = () => {
    updateScheduled = false

    const newBatch: UpdateEntry[] = []
    for (const [id, node] of nodeAnimations) {
      if (node.currentY !== node.targetY) {
        newBatch.push({ id, node, from: node.currentY, to: node.targetY })
      }
    }

    if (!newBatch.length) {
      return
    }

    currentAnimation?.cancel()
    currentBatch = newBatch
    progress.value = 0

    currentAnimation = animate(progress, {
      value: 1,
      duration: 350,
      ease: 'outQuint',
      onUpdate: onFrame,
      onComplete: onFrame,
    })
  }

  /**
   * Declares the vertical offset a node should be displayed at.
   */
  const setNodeTarget = (id: ElementId, targetY: number) => {
    const node = nodeAnimations.get(id)

    if (!node) {
      const newNode = { currentY: targetY, targetY }
      nodeAnimations.set(id, newNode)
      placeNode(id, newNode)
      return
    }

    // Re-apply state in case this id was claimed by a new instance.
    placeNode(id, node)

    if (node.targetY !== targetY) {
      node.targetY = targetY

      if (!updateScheduled) {
        updateScheduled = true
        queueMicrotask(startUpdate)
      }
    }
  }

  /**
   * Drops the animation state of a node, used when it unmounts.
   */
  const removeNode = (id: ElementId) => {
    nodeAnimations.delete(id)
  }

  /**
   * Registers or unregisters the `<path>` element of the edge pointing at the given element id.
   */
  const registerPath = (id: ElementId, path: SVGPathElement | null) => {
    if (path) {
      edgePaths.set(id, path)
    } else {
      edgePaths.delete(id)
    }
  }

  return { setNodeTarget, removeNode, registerPath }
}

export const graphAnimator = createGraphAnimator()
