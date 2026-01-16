import { type ComponentType, type RefObject, useEffect, useRef } from 'react'

import {
  type ThrottleOptions,
  useRerender,
  useThrottledCallback,
} from '@/utils/performance'
import { MS_IN_SECOND } from '@/utils/time'
import type { AnyObject } from '@/utils/types'

import {
  type ElementId,
  type ParentElement,
  registerElement,
  type TrackedElement,
  unregisterElement,
} from './store'

interface TrackedComponentProps {
  elementId: ElementId
  parent: ParentElement | undefined
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
    const { elementId, parent, ...componentProps } = props

    const ref = useRef<T>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: manually handle item registration
    useEffect(() => {
      if (ref.current) {
        registerElement(elementId, {
          ref: ref as RefObject<T>,
          parent,
        })
      }

      return () => {
        unregisterElement(elementId)
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

/**
 * Hook that refreshes the SVG overlay when needed.
 *
 * @param ref - A ref to the container element of the SVG overlay.
 */
const useSyncCanvas = (ref: RefObject<HTMLDivElement>) => {
  const { refresh } = useRefreshCanvas()
  const observer = useRef(new ResizeObserver(refresh))

  // biome-ignore lint/correctness/useExhaustiveDependencies: only want to run on mount/unmount
  useEffect(() => {
    const element = ref.current

    if (element) {
      observer.current.observe(element)
    }

    return () => {
      if (element) {
        observer.current.disconnect()
      }
    }
  }, [])
}

export {
  makeTracked,
  getPosition,
  useSyncCanvas,
  type TrackRefProps,
  type Position,
}
