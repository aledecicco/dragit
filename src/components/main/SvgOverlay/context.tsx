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

import type { BranchName, CommitId } from '@api/models'

type ElementId = string

interface Element {
  ref: RefObject<HTMLElement>
  commitId: CommitId
  branch: BranchName
  parent: ElementId | undefined
}

interface SvgOverlayState {
  elements: Map<CommitId, Element>
  registerElement: (id: CommitId, element: Element) => void
  unregisterElement: (id: CommitId) => void
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
  const [elements, setElements] = useState<Map<string, Element>>(new Map())
  const svgRef = useRef<SVGSVGElement>(null)
  const componentRef = useRef<HTMLDivElement>(null)

  const registerElement = useCallback((id: string, element: Element) => {
    setElements((prevElements) => {
      const newElements = new Map(prevElements)
      newElements.set(id, element)
      return newElements
    })
  }, [])

  const unregisterElement = useCallback((id: string) => {
    setElements((prevElements) => {
      const newElements = new Map(prevElements)
      newElements.delete(id)
      return newElements
    })
  }, [])

  const painting = useRef(false)
  const pan = useCallback((x: number, y: number) => {
    if (!painting.current) {
      painting.current = true
      requestAnimationFrame(() => {
        if (svgRef.current && componentRef.current) {
          componentRef.current.scrollLeft += x
          componentRef.current.scrollTop += y

          svgRef.current.setAttribute(
            'viewBox',
            `${componentRef.current.scrollLeft} ${componentRef.current.scrollTop} ${componentRef.current.clientWidth} ${componentRef.current.clientHeight}`,
          )
        }
        painting.current = false
      })
    }
  }, [])

  const [n, rerender] = useReducer((n) => n + 1, 0)
  const refresh = useCallback(() => {
    rerender()
    pan(0, 0)
  }, [pan])
  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    const scroll = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      pan(e.deltaX * 2, e.deltaY * 2)
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
  }, [n, elements, registerElement, unregisterElement])

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
}
