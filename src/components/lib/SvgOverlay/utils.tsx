import { type ComponentType, type Ref, useEffect, useRef } from 'react'

import {
  type ThrottleOptions,
  useRerender,
  useThrottledCallback,
} from '@utils/performance'
import { MS_IN_SECOND } from '@utils/time'
import type { AnyObject } from '@utils/types'
import {
  type Element,
  type ElementId,
  type ParentRel,
  useSvgOverlay,
} from './context'

interface TrackedComponentProps<R extends string> {
  elementId: ElementId
  parent: ParentRel<R> | undefined
}

interface TrackRefProps<T extends HTMLElement> {
  trackRef: Ref<T>
}

/**
 * HOC that wraps a component and automatically registers it when it mounts and unregisters it when it unmounts.
 *
 * Also provides a ref that should be attached by the inner component to the element that's going to be tracked.
 */
const makeTracked = <
  P extends AnyObject,
  T extends HTMLElement,
  R extends string = string,
>(
  WrappedComponent: ComponentType<
    Omit<P, keyof TrackedComponentProps<R>> & TrackRefProps<T>
  >,
) => {
  const TrackedComponent = (props: P & TrackedComponentProps<R>) => {
    const { elementId, parent, ...componentProps } = props
    const svgOverlay = useSvgOverlay()

    const ref = useRef<T>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: manually handle item registration
    useEffect(() => {
      svgOverlay.registerElement(elementId, {
        ref,
        parent,
      })

      return () => {
        svgOverlay.unregisterElement(elementId)
      }
    }, [elementId, parent?.id, parent?.type])

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
const getPosition = (elem: Element): Position => {
  const pos = { x: 0, y: 0 }

  if (elem.ref.current) {
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
  }

  return pos
}

const REFRESH_OPTIONS: ThrottleOptions = {
  trailingCall: true,
  delay: MS_IN_SECOND / 60,
}

/**
 * Hook that provides a way to trigger a refresh of the SVG overlay, throttled to 60 FPS.
 *
 * @returns An object containing:
 * - `refreshTrigger`: A variable that can be used as a dependency to trigger a refresh.
 * - `refresh`: A function that can be called to manually trigger a refresh.
 */
const useRefreshCanvas = () => {
  const { rerenderTrigger, rerender } = useRerender()
  const refresh = useThrottledCallback(rerender, REFRESH_OPTIONS)

  return { refreshTrigger: rerenderTrigger, refresh }
}

export { makeTracked, type TrackRefProps, getPosition, type Position }
export { useRefreshCanvas }
