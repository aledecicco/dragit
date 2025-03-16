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
