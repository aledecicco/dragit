import { type ComponentType, type Ref, useEffect, useRef } from 'react'

import { type Element, type ElementId, useSvgOverlay } from './context'

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

interface TrackedComponentProps {
  elementId: ElementId
  parentId: ElementId | undefined
}

interface TrackRefProps<T extends HTMLElement> {
  trackRef: Ref<T>
}

const makeTracked = <P, T extends HTMLElement>(
  WrappedComponent: ComponentType<P & TrackRefProps<T>>,
) => {
  const TrackedComponent = (
    props: Omit<P, 'trackRef'> & TrackedComponentProps,
  ) => {
    const { elementId, parentId, ...componentProps } = props
    const svgOverlay = useSvgOverlay()

    const ref = useRef<T>(null)

    useEffect(() => {
      svgOverlay.registerElement(elementId, {
        ref,
        parent: parentId,
      })

      return () => {
        svgOverlay.unregisterElement(elementId)
      }
    }, [
      elementId,
      parentId,
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

export { makeTracked, type TrackRefProps, getPosition }
