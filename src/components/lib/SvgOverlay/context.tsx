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

import type { LiteralUnion } from '@utils/types'
import { scheduleSyncSvg, usePan, useRefreshCanvas } from './utils'

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
      if (prevElements.has(id)) {
        const newElements = new Map(prevElements)
        newElements.delete(id)
        return newElements
      }

      return prevElements
    })
  }, [])

  const pan = usePan(componentRef, svgRef)

  const { refreshTrigger, refresh } = useRefreshCanvas(componentRef, svgRef)
  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    const onScroll = (_event: Event) => {
      const event = _event as WheelEvent
      pan({ x: event.deltaX, y: event.deltaY })
      event.preventDefault()
      event.stopPropagation()
    }

    const onFocusInside = (_event: Event) => {
      scheduleSyncSvg(componentRef, svgRef)
    }

    if (componentRef.current) {
      componentRef.current.addEventListener('wheel', onScroll)
      componentRef.current.addEventListener('focusin', onFocusInside)
      observer.current.observe(componentRef.current)
    }

    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('wheel', onScroll)
        componentRef.current.removeEventListener('focusin', onFocusInside)
        observer.current.disconnect()
      }
    }
  }, [pan])

  // biome-ignore lint/correctness/useExhaustiveDependencies(refreshTrigger): refreshTrigger is added to force re-renders
  const contextValue: SvgOverlayState = useMemo(() => {
    return {
      elements,
      registerElement,
      unregisterElement,
      svgRef,
      componentRef,
      refresh,
    }
  }, [elements, refresh, registerElement, unregisterElement, refreshTrigger])

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
