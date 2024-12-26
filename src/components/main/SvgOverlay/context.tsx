import {
  type EventHandler,
  type PropsWithChildren,
  type RefObject,
  type UIEvent,
  type UIEventHandler,
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
  scrollerRef: RefObject<HTMLDivElement>
  svgRef: RefObject<SVGSVGElement>
  componentRef: RefObject<HTMLDivElement>
  refresh: () => void
}

const emptyState: SvgOverlayState = {
  elements: new Map(),
  registerElement: () => {},
  unregisterElement: () => {},
  scrollerRef: { current: null },
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
  const scrollerRef = useRef<HTMLDivElement>(null)
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

  const syncSvg = useCallback(() => {
    if (svgRef.current && componentRef.current) {
      svgRef.current.setAttribute(
        'viewBox',
        `${componentRef.current.scrollLeft} ${componentRef.current.scrollTop} ${componentRef.current.clientWidth} ${componentRef.current.clientHeight}`,
      )
    }
  }, [])

  const syncScroller = useCallback(() => {
    if (scrollerRef.current && componentRef.current) {
      scrollerRef.current.style.width = `${componentRef.current.scrollWidth}px`
      scrollerRef.current.style.height = `${componentRef.current.scrollHeight}px`
      scrollerRef.current.style.maxWidth = `${componentRef.current.clientWidth}px`
      scrollerRef.current.style.maxHeight = `${componentRef.current.clientHeight}px`
    }
  }, [])

  const painting = useRef(false)
  const panTo = useCallback(
    (x: number, y: number) => {
      if (!painting.current) {
        painting.current = true
        requestAnimationFrame(() => {
          if (componentRef.current) {
            componentRef.current.scrollLeft = x
            componentRef.current.scrollTop = y

            syncSvg()
          }
          painting.current = false
        })
      }
    },
    [syncSvg],
  )

  const [n, rerender] = useReducer((n) => n + 1, 0)
  const refresh = useCallback(() => {
    syncScroller()
    syncSvg()
    rerender()
  }, [syncSvg, syncScroller])
  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    const scroll = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const div = e.currentTarget as HTMLDivElement
      console.log(e)
      panTo(div.scrollTop, div.scrollLeft)
    }

    if (componentRef.current && scrollerRef.current) {
      scrollerRef.current.addEventListener('scroll', scroll)
      observer.current.observe(componentRef.current)
    }
    window.addEventListener('resize', refresh)

    return () => {
      if (scrollerRef.current) {
        scrollerRef.current.removeEventListener('scroll', scroll)
        observer.current.disconnect()
      }
      window.removeEventListener('resize', refresh)
    }
  }, [panTo, refresh])

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to update context when rerender is forced
  const contextValue: SvgOverlayState = useMemo(() => {
    return {
      elements,
      registerElement,
      unregisterElement,
      scrollerRef,
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
