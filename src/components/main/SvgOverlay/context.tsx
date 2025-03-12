import {
  type PropsWithChildren,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { clamp } from '@utils/number'
import {
  useRerender,
  useThrottle,
  useThrottleWithAccumulator,
} from '@utils/performance'
import type { LiteralUnion } from '@utils/types'

type ElementId = string

// ToDo: can this type be solved with less levels?
interface Element<
  R extends string = string,
  T extends LiteralUnion<R> = string,
> {
  ref: RefObject<HTMLElement | null>
  parent: ParentRel<LiteralUnion<T>> | undefined
}

interface ParentRel<R extends string> {
  id: ElementId
  type: R
}

interface SvgOverlayState {
  elements: Map<ElementId, Element>
  registerElement: (id: ElementId, element: Element) => void
  unregisterElement: (id: ElementId) => void
  svgRef: RefObject<SVGSVGElement | null>
  componentRef: RefObject<HTMLDivElement | null>
  refresh: () => void
}

const emptyState: SvgOverlayState = {
  elements: new Map(),
  registerElement: () => {},
  unregisterElement: () => {},
  svgRef: { current: null },
  componentRef: { current: null },
  refresh: () => {},
}

const SvgOverlayContext = createContext(emptyState)

const useSvgOverlay = () => useContext(SvgOverlayContext)

interface SvgOverlayContextProviderProps extends PropsWithChildren {}

const SvgOverlayContextProvider = (props: SvgOverlayContextProviderProps) => {
  const { children } = props
  const [elements, setElements] = useState<Map<ElementId, Element>>(new Map())
  const svgRef = useRef<SVGSVGElement>(null)
  const componentRef = useRef<HTMLDivElement>(null)

  const registerElement = useCallback((id: ElementId, element: Element) => {
    setElements((prevElements) => {
      const newElements = new Map(prevElements)
      newElements.set(id, element)
      return newElements
    })
  }, [])

  const unregisterElement = useCallback((id: ElementId) => {
    setElements((prevElements) => {
      const newElements = new Map(prevElements)
      newElements.delete(id)
      return newElements
    })
  }, [])

  const syncSvg = useCallback(() => {
    if (svgRef.current && componentRef.current) {
      svgRef.current.setAttribute(
        'viewBox',
        `${componentRef.current.scrollLeft} ${componentRef.current.scrollTop} ${componentRef.current.clientWidth} ${componentRef.current.clientHeight}`,
      )
    }
  }, [])

  const pan = useThrottleWithAccumulator(
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

        syncSvg()
      }
    },
    1000 / 120,
    { x: 0, y: 0 },
    (accum, distance) => ({ x: accum.x + distance.x, y: accum.y + distance.y }),
    true,
  )

  const { refresherDep, rerender } = useRerender()
  const refresh = useThrottle(
    () => {
      syncSvg()
      rerender()
    },
    1000 / 120,
    false,
  )
  const observer = useRef(new ResizeObserver(refresh))

  const refreshAfter = useCallback(() => {
    requestAnimationFrame(() => syncSvg())
  }, [syncSvg])

  useEffect(() => {
    const scroll = (_event: Event) => {
      const event = _event as WheelEvent
      pan({ x: event.deltaX, y: event.deltaY })
      event.preventDefault()
      event.stopPropagation()
    }

    if (componentRef.current) {
      componentRef.current.addEventListener('wheel', scroll)
      componentRef.current.addEventListener('focusin', refreshAfter)
      observer.current.observe(componentRef.current)
    }

    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('wheel', scroll)
        componentRef.current.removeEventListener('focusin', refreshAfter)
        observer.current.disconnect()
      }
    }
  }, [pan, refreshAfter])

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to update context when rerender is forced
  const contextValue: SvgOverlayState = useMemo(() => {
    return {
      elements,
      registerElement,
      unregisterElement,
      svgRef,
      componentRef,
      refresh,
    }
  }, [refresherDep, elements, registerElement, unregisterElement])

  return (
    <SvgOverlayContext.Provider value={contextValue}>
      {children}
    </SvgOverlayContext.Provider>
  )
}

export {
  SvgOverlayContextProvider,
  useSvgOverlay,
  type Element,
  type ElementId,
  type ParentRel,
  type SvgOverlayState,
}
