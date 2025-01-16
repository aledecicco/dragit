import { type ComponentType, type Ref, useEffect, useRef } from 'react'

import { type Element, type ElementId, useSvgOverlay } from './context'

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
