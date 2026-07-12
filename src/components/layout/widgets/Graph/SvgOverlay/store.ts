import type { RefObject } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type ElementId = string

type ParentType = 'solid' | 'dashed' | 'unconfirmed' | 'draft'

interface TrackedElement {
  /**
   * A ref to the element being displayed, used for position calculation.
   */
  ref: RefObject<HTMLElement>

  /**
   * An optional parent relationship to another element.
   */
  parent: ParentElement | undefined
}

interface TrackedElements extends Map<ElementId, TrackedElement> {}

interface ParentElement {
  /**
   * The unique identifier of the parent element.
   */
  id: ElementId

  /**
   * The type of relationship this element has with its parent.
   * Used to allow different styles of connections.
   */
  type: ParentType
}

interface SvgTracker {
  /**
   * A map of all registered elements.
   */
  elements: TrackedElements
}

interface Setters {
  /**
   * A callback that registers an element in the overlay.
   *
   * @param id - The unique identifier of the element.
   * @param element - The element to register.
   */
  registerElement: (id: ElementId, element: TrackedElement) => void

  /**
   * A callback that unregisters an element from the overlay.
   *
   * @param id - The unique identifier of the element.
   */
  unregisterElement: (id: ElementId) => void
}

const useSvgTrackerStore = create<SvgTracker & Setters>()((setState) => ({
  elements: new Map(),

  registerElement: (id: ElementId, element: TrackedElement) => {
    setState((state) => {
      const elements = new Map(state.elements)
      elements.set(id, element)
      return { elements }
    })
  },

  unregisterElement: (id: ElementId) => {
    setState((state) => {
      const elements = new Map(state.elements)
      elements.delete(id)
      return { elements }
    })
  },
}))

/**
 * Hook that facilitates tracking SVG overlay elements.
 */
const useTrackedElements = (): TrackedElements => {
  const elements = useSvgTrackerStore(
    useShallow((state) => {
      return state.elements
    }),
  )

  return elements
}

/**
 * Register an element to be tracked in the SVG overlay.
 */
const registerElement = useSvgTrackerStore.getState().registerElement

/**
 * Unregister an element to stop it from being tracked in the SVG overlay.
 */
const unregisterElement = useSvgTrackerStore.getState().unregisterElement

/**
 * Get the currently registered elements in the SVG overlay.
 */
const getRegisteredElements = () => useSvgTrackerStore.getState().elements

export {
  useTrackedElements,
  useSvgTrackerStore,
  registerElement,
  unregisterElement,
  getRegisteredElements,
  type ElementId,
  type ParentType,
  type TrackedElements,
  type TrackedElement,
  type ParentElement,
}
