import {
  type PropsWithChildren,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
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
  refresh: () => void
}

const emptyState: SvgOverlayState = {
  elements: new Map(),
  registerElement: () => {},
  unregisterElement: () => {},
  refresh: () => {},
}

const SvgOverlayContext = createContext(emptyState)

const useSvgOverlay = () => useContext(SvgOverlayContext)

const SvgOverlayContextProvider = (props: PropsWithChildren) => {
  const { children } = props
  const [elements, setElements] = useState<Map<string, Element>>(new Map())

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

  const [n, refresh] = useReducer((n) => n + 1, 0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const contextValue: SvgOverlayState = useMemo(() => {
    return {
      elements,
      registerElement,
      unregisterElement,
      refresh,
    }
  }, [elements, registerElement, unregisterElement, n])

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
