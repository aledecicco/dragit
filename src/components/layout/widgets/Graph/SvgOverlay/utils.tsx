import { type ComponentType, type RefObject, useEffect, useRef } from 'react'

import type { AnyObject } from '@/utils/types'

import { graphAnimator } from './animation'
import {
  type ElementId,
  getRegisteredElements,
  type ParentElement,
  registerElement,
  type TrackedElement,
  unregisterElement,
} from './store'

interface TrackedComponentProps {
  /**
   * The unique id of this element in the tracker.
   */
  elementId: ElementId

  /**
   * A relationship to a parent element.
   */
  parent: ParentElement | undefined

  /**
   * The vertical offset the element should be displayed at.
   */
  targetY: number
}

interface TrackRefProps<T extends HTMLElement> {
  trackRef: RefObject<T | null>
}

/**
 * HOC that wraps a component and automatically registers it when it mounts and unregisters it when it unmounts.
 *
 * Also provides a ref that should be attached by the inner component to the element that's going to be tracked.
 */
const makeTracked = <P extends AnyObject, T extends HTMLElement>(
  WrappedComponent: ComponentType<
    Omit<P, keyof TrackedComponentProps> & TrackRefProps<T>
  >,
) => {
  const TrackedComponent = (props: P & TrackedComponentProps) => {
    const { elementId, parent, targetY, ...componentProps } = props

    const ref = useRef<T>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: manually handle item registration
    useEffect(() => {
      if (ref.current) {
        registerElement(elementId, {
          ref: ref as RefObject<T>,
          parent,
        })
      }
    }, [elementId, parent?.id, parent?.type])

    useEffect(() => {
      graphAnimator.setNodeTarget(elementId, targetY)
    }, [elementId, targetY])

    useEffect(() => {
      return () => {
        // If another instance re-registered this id in the meantime, leave it alive.
        if (getRegisteredElements().get(elementId)?.ref === ref) {
          unregisterElement(elementId)
        }

        // Only clean up this animation if no other instance claimed it.
        queueMicrotask(() => {
          if (!getRegisteredElements().has(elementId)) {
            graphAnimator.removeNode(elementId)
          }
        })
      }
    }, [elementId])

    return <WrappedComponent {...componentProps} trackRef={ref} />
  }

  return TrackedComponent
}

interface Position {
  x: number
  y: number
}

/**
 * Given an element, returns its position in the SVG overlay.
 *
 * Accounts for transformations and offsets.
 *
 * @param elem - The element to get the position of.
 */
const getPosition = (elem: TrackedElement): Position => {
  const pos = { x: 0, y: 0 }

  pos.x += elem.ref.current.offsetLeft
  pos.y += elem.ref.current.offsetTop

  const transform = window.getComputedStyle(elem.ref.current).transform

  if (transform !== 'none') {
    const matrix = transform.match(/matrix.*\((.+)\)/)
    if (matrix?.[1]) {
      const values = matrix[1].split(', ')
      pos.x += Number.parseFloat(values[4])
      pos.y += Number.parseFloat(values[5])
    }
  }

  return pos
}

export { makeTracked, getPosition, type TrackRefProps, type Position }
