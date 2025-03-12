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

  const painting = useRef(false)
  const accumulator = useRef({ x: 0, y: 0 })

  const pan = useCallback(
    (dx: number, dy: number) => {
      accumulator.current.x += dx
      accumulator.current.y += dy

      if (!painting.current) {
        const distance = { ...accumulator.current }
        painting.current = true
        accumulator.current = { x: 0, y: 0 }

        requestAnimationFrame(() => {
          if (componentRef.current) {
            componentRef.current.scrollLeft = clamp(
              componentRef.current.scrollLeft + distance.x,
              0,
              componentRef.current.scrollWidth -
                componentRef.current.clientWidth,
            )
            componentRef.current.scrollTop = clamp(
              componentRef.current.scrollTop + distance.y,
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

  const [refresherDep, rerender] = useReducer((n) => (n + 1) % 60, 0)
  const refresh = useCallback(() => {
    syncSvg()
    rerender()
  }, [syncSvg])
  const observer = useRef(new ResizeObserver(refresh))

  const refreshAfter = useCallback(() => {
    requestAnimationFrame(() => syncSvg())
  }, [syncSvg])

  useEffect(() => {
    const scroll = (_event: Event) => {
      const event = _event as WheelEvent
      pan(event.deltaX, event.deltaY)
      event.preventDefault()
      event.stopPropagation()
    }

    if (componentRef.current) {
      componentRef.current.addEventListener('wheel', scroll)
      componentRef.current.addEventListener('focusin', refreshAfter)
      observer.current.observe(componentRef.current)
    }
    window.addEventListener('resize', refresh)

    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('wheel', scroll)
        componentRef.current.removeEventListener('focusin', refreshAfter)
        observer.current.disconnect()
      }
      window.removeEventListener('resize', refresh)
    }
  }, [pan, refresh, refreshAfter])

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
