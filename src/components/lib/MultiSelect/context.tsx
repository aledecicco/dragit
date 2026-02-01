import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

interface MultiSelectStore {
  /**
   * The index of the last selected item.
   */
  lastSelected: number | undefined

  /**
   * The index of the last item used for extending selection.
   */
  lastExtension: number | undefined

  /**
   * The indexes of the selected items.
   */
  selected: Set<number>
}

interface Setters {
  /**
   * Toggle an item's selected state.
   *
   * @param item - The index of the item to select.
   */
  toggle: (item: number) => void

  /**
   * Extend the selection from the last selected item to a specific item.
   *
   * @param item - The index of the item to extend the selection to.
   */
  extendSelection: (item: number) => void

  /**
   * Overrides the selection.
   *
   * @param items - The new set of item indexes.
   */
  setSelection: (items: number | number[]) => void
}

const MultiSelectContext = createContext<StoreApi<
  MultiSelectStore & Setters
> | null>(null)

const MultiSelectContextProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [store] = useState(() =>
    createStore<MultiSelectStore & Setters>()(
      immer((setState) => ({
        lastSelected: undefined,

        lastExtension: undefined,

        selected: new Set<number>(),

        toggle: (item: number) =>
          setState((state) => {
            if (state.selected.has(item)) {
              state.selected.delete(item)
            } else {
              state.selected.add(item)
              state.lastSelected = item
              state.lastExtension = undefined
            }
          }),

        extendSelection: (item: number) =>
          setState((state) => {
            if (state.lastSelected === undefined) {
              state.selected.add(item)
              state.lastSelected = item
              state.lastExtension = undefined
              return
            }

            if (state.lastExtension !== undefined) {
              // clear previous extension
              const start = Math.min(state.lastSelected, state.lastExtension)
              const end = Math.max(state.lastSelected, state.lastExtension)

              for (let i = start; i <= end; i++) {
                state.selected.delete(i)
              }
            }

            const start = Math.min(state.lastSelected, item)
            const end = Math.max(state.lastSelected, item)

            for (let i = start; i <= end; i++) {
              state.selected.add(i)
            }

            state.lastExtension = item
          }),

        setSelection: (items: number | number[]) =>
          setState((state) => {
            state.selected.clear()
            state.lastExtension = undefined

            if (Array.isArray(items)) {
              items.forEach((item) => {
                state.selected.add(item)
              })
              state.lastSelected = items.at(-1)
            } else {
              state.selected.add(items)
              state.lastSelected = items
            }
          }),
      })),
    ),
  )

  return (
    <MultiSelectContext.Provider value={store}>
      {children}
    </MultiSelectContext.Provider>
  )
}

/**
 * Hook that retrieves the closest multiselect context.
 */
const useMultiSelectContext = () => {
  const context = useContext(MultiSelectContext)

  if (!context) {
    throw new Error('No multiselect provider found')
  }

  return context
}

/**
 * Hook that retrieves the current selected items.
 */
const useSelectedItems = () => {
  const store = useMultiSelectContext()

  return useStore(
    store,
    useShallow((state) => state.selected),
  )
}

/**
 * Hook that tracks whether a specific item is selected.
 *
 * @param item - The index of the item to track.
 */
const useIsSelected = (item: number) => {
  const store = useMultiSelectContext()

  return useStore(store, (state) => state.selected.has(item))
}

/**
 * Hook that provides functions to update the combobox state.
 *
 * @returns An object containing:
 * - `setSearch`: Function to update the search query.
 * - `setCurrentGroup`: Function to update the current group.
 */
const useSelectionUpdater = () => {
  const store = useMultiSelectContext()

  return useStore(
    store,
    useShallow((state) => ({
      toggle: state.toggle,
      extendSelection: state.extendSelection,
      setSelection: state.setSelection,
    })),
  )
}

export {
  MultiSelectContextProvider,
  useSelectedItems,
  useIsSelected,
  useSelectionUpdater,
}
