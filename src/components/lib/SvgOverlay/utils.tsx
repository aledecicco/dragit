import {
  type ComponentType,
  type Ref,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { clamp } from '@utils/number'
import {
  type WithAccumulator,
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

const syncSvg = (
  componentRef: RefObject<HTMLDivElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) => {
  if (svgRef.current && componentRef.current) {
    svgRef.current.setAttribute(
      'viewBox',
      `${componentRef.current.scrollLeft} ${componentRef.current.scrollTop} ${componentRef.current.clientWidth} ${componentRef.current.clientHeight}`,
    )
  }
}

const scheduleSyncSvg = (
  componentRef: RefObject<HTMLDivElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) => {
  requestAnimationFrame(() => syncSvg(componentRef, svgRef))
}

interface Distance {
  x: number
  y: number
}

const PAN_OPTIONS: WithAccumulator<Distance> = {
  waitForFrame: true,
  trailingCall: true,
  delay: MS_IN_SECOND / 60,
  withAccumulator: {
    initial: { x: 0, y: 0 },
    update: (accum, distance) => ({
      x: accum.x + distance.x,
      y: accum.y + distance.y,
    }),
  },
}

const usePan = (
  componentRef: RefObject<HTMLDivElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) =>
  useThrottledCallback(
    (distance) => {
      if (componentRef.current) {
        componentRef.current.scrollLeft = clamp(
          componentRef.current.scrollLeft + distance.x,
          0,
          componentRef.current.scrollWidth - componentRef.current.clientWidth,
        )
        componentRef.current.scrollTop = clamp(
          componentRef.current.scrollTop + distance.y,
          0,
          componentRef.current.scrollHeight - componentRef.current.clientHeight,
        )

        syncSvg(componentRef, svgRef)
      }
    },
    [componentRef, svgRef],
    PAN_OPTIONS,
  )

const REFRESH_OPTIONS: WithoutAccumulator = {
  waitForFrame: false,
  trailingCall: true,
  delay: MS_IN_SECOND / 60,
}

const useRefreshCanvas = (
  componentRef: RefObject<HTMLDivElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) => {
  const { rerenderTrigger, rerender } = useRerender()

  const refresh = useThrottledCallback(
    () => {
      syncSvg(componentRef, svgRef)
      rerender()
    },
    [rerender, componentRef, svgRef],
    REFRESH_OPTIONS,
  )

  return useMemo(
    () => ({ refreshTrigger: rerenderTrigger, refresh: refresh }),
    [rerenderTrigger, refresh],
  )
}

export { makeTracked, type TrackRefProps, getPosition }
export { syncSvg, scheduleSyncSvg, usePan, useRefreshCanvas }
