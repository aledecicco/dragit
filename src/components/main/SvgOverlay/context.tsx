import {
  type PropsWithChildren,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'

import { clamp } from '@utils/number'

export const SCROLL_SPEED = 2.5

type ElementId = string

interface Element {
  ref: RefObject<HTMLElement>
  parent: ParentRel | undefined
}

interface ParentRel {
  id: ElementId
  type: string
}

interface SvgOverlayState {
  elements: Map<ElementId, Element>
  registerElement: (id: ElementId, element: Element) => void
  unregisterElement: (id: ElementId) => void
  svgRef: RefObject<SVGSVGElement>
  componentRef: RefObject<HTMLDivElement>
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

  const painting = useRef(false)
  const pan = useCallback(
    (dx: number, dy: number) => {
      if (!painting.current) {
        painting.current = true
        requestAnimationFrame(() => {
          if (componentRef.current) {
            componentRef.current.scrollLeft = clamp(
              componentRef.current.scrollLeft + dx,
              0,
              componentRef.current.scrollWidth -
                componentRef.current.clientWidth,
            )
            componentRef.current.scrollTop = clamp(
              componentRef.current.scrollTop + dy,
              0,
              componentRef.current.scrollHeight -
                componentRef.current.clientHeight,
            )

            syncSvg()
          }

          setTimeout(() => {
            painting.current = false
          }, 1000 / 60)
        })
      }
    },
    [syncSvg],
  )

  const [refresherDep, rerender] = useReducer((n) => n + 1, 0)
  const refresh = useCallback(() => {
    syncSvg()
    rerender()
  }, [syncSvg])
  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    const scroll = (_event: Event) => {
      const event = _event as WheelEvent
      pan(event.deltaX * SCROLL_SPEED, event.deltaY * SCROLL_SPEED)
      event.preventDefault()
      event.stopPropagation()
    }

    if (componentRef.current) {
      componentRef.current.addEventListener('wheel', scroll)
      observer.current.observe(componentRef.current)
    }
    window.addEventListener('resize', refresh)

    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('wheel', scroll)
        observer.current.disconnect()
      }
      window.removeEventListener('resize', refresh)
    }
  }, [pan, refresh])

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
