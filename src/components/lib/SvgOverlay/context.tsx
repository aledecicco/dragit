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
import { useRefreshCanvas } from './utils'

type ElementId = string

// ToDo: can this type be solved with less levels?
interface Element<
  R extends string = string,
  T extends LiteralUnion<R> = string,
> {
  /**
   * A ref to the element being displayed, used for position calculation.
   */
  ref: RefObject<HTMLElement | null>

  /**
   * An optional parent relationship to another element.
   */
  parent: ParentRel<LiteralUnion<T>> | undefined
}

interface ParentRel<R extends string> {
  /**
   * The unique identifier of the parent element.
   */
  id: ElementId

  /**
   * The type of relationship this element has with its parent.
   * Used to allow different styles of connections.
   */
  type: R
}

interface SvgOverlayState {
  /**
   * A map of all registered elements.
   */
  elements: Map<ElementId, Element>

  /**
   * A callback that registers an element in the overlay.
   *
   * @param id - The unique identifier of the element.
   * @param element - The element to register.
   */
  registerElement: (id: ElementId, element: Element) => void

  /**
   * A callback that unregisters an element from the overlay.
   *
   * @param id - The unique identifier of the element.
   */
  unregisterElement: (id: ElementId) => void

  /**
   * A ref to the native svg element.
   */
  svgRef: RefObject<SVGSVGElement | null>

  /**
   * A ref to the component that contains the svg overlay.
   */
  componentRef: RefObject<HTMLDivElement | null>

  /**
   * A callback to manually trigger re-renders.
   */
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

/**
 * Context that provides access to a set of tracked elements and their relationships.
 *
 * Handles refreshes and position calculations when the set of elements changes, or when the component is resized.
 */
const SvgOverlayContextProvider = (props: SvgOverlayContextProviderProps) => {
  const { children } = props
  const [elemsState, setElemsState] = useState<Map<ElementId, Element>>(
    new Map(),
  )
  const svgRef = useRef<SVGSVGElement>(null)
  const componentRef = useRef<HTMLDivElement>(null)

  const registerElement = useCallback((id: ElementId, element: Element) => {
    setElemsState((prevElems) => {
      const newElems = new Map(prevElems)
      newElems.set(id, element)
      return newElems
    })
  }, [])

  const unregisterElement = useCallback((id: ElementId) => {
    setElemsState((prevElems) => {
      if (prevElems.has(id)) {
        const newElems = new Map(prevElems)
        newElems.delete(id)
        return newElems
      }

      return prevElems
    })
  }, [])

  const { refreshTrigger, refresh } = useRefreshCanvas()

  // biome-ignore lint/correctness/useExhaustiveDependencies(refreshTrigger): refreshTrigger is added to force re-renders
  const elements = useMemo(() => {
    return new Map(elemsState)
  }, [elemsState, refreshTrigger])

  const observer = useRef(new ResizeObserver(refresh))
  useEffect(() => {
    if (componentRef.current) {
      observer.current.observe(componentRef.current)
    }

    return () => {
      if (componentRef.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  const contextValue: SvgOverlayState = useMemo(() => {
    return {
      elements,
      registerElement,
      unregisterElement,
      svgRef,
      componentRef,
      refresh,
    }
  }, [elements, refresh, registerElement, unregisterElement])

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
