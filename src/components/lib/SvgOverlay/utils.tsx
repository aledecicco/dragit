import { type ComponentType, type Ref, useEffect, useMemo, useRef } from 'react'

import {
  type WithoutAccumulator,
  useRerender,
  useThrottledCallback,
} from '@utils/performance'
import { MS_IN_SECOND } from '@utils/time'
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

const makeTracked = <P, T extends HTMLElement, R extends string = string>(
  WrappedComponent: ComponentType<P & TrackRefProps<T>>,
) => {
  const TrackedComponent = (
    props: Omit<P, 'trackRef'> & TrackedComponentProps<R>,
  ) => {
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
    }, [
      elementId,
      parent?.id,
      parent?.type,
      svgOverlay.registerElement,
      svgOverlay.unregisterElement,
    ])

    return <WrappedComponent {...(componentProps as P)} trackRef={ref} />
  }

  return TrackedComponent
}

const getPosition = (elem: Element) => {
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

const REFRESH_OPTIONS: WithoutAccumulator = {
  trailingCall: true,
  delay: MS_IN_SECOND / 60,
}

const useRefreshCanvas = () => {
  const { rerenderTrigger, rerender } = useRerender()

  const refresh = useThrottledCallback(rerender, [], REFRESH_OPTIONS)

  return useMemo(
    () => ({ refreshTrigger: rerenderTrigger, refresh }),
    [rerenderTrigger, refresh],
  )
}

export { makeTracked, type TrackRefProps, getPosition }
export { useRefreshCanvas }
