import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

interface ComboboxStore {
  /**
   * The current search query.
   */
  search: string

  /**
   * The current tab in the combobox.
   */
  currentGroup: string | undefined

  /**
   * The available groups in the combobox.
   */
  groups: ComboboxGroup[]
}

interface ComboboxGroup {
  /**
   * The name of the group, used for identification.
   */
  name: string

  /**
   * Callback to invoke when an item in this group is selected.
   *
   * @param item - The selected item.
   */
  onSelect: (item: string) => void
}

interface Setters {
  /**
   * Sets the current search query.
   *
   * @param newSearch - The new search query.
   */
  setSearch: (newSearch: string) => void

  /**
   * Selects a group in the combobox.
   *
   * @param newGroupId - The group to select.
   */
  setCurrentGroup: (newGroupId: string | undefined) => void

  /**
   * Updates the set of available groups.
   *
   * @param newGroups - The new set of groups.
   */
  setGroups: (newGroups: ComboboxGroup[]) => void
}

const ComboboxContext = createContext<StoreApi<ComboboxStore & Setters> | null>(
  null,
)

const ComboboxContextProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [store] = useState(() =>
    createStore<ComboboxStore & Setters>()(
      immer((setState) => ({
        search: '',
        currentGroup: undefined,
        groups: [],

        setSearch: (newSearch) => {
          setState((state) => {
            state.search = newSearch
          })
        },

        setCurrentGroup: (newGroup) => {
          setState((state) => {
            state.currentGroup = newGroup
          })
        },

        setGroups: (newGroups) => {
          setState((state) => {
            state.groups = newGroups
          })
        },
      })),
    ),
  )

  return (
    <ComboboxContext.Provider value={store}>
      {children}
    </ComboboxContext.Provider>
  )
}

/**
 * Hook that retrieves the closest combobox context.
 */
const useComboboxContext = () => {
  const context = useContext(ComboboxContext)
  if (!context) {
    throw new Error('No combobox provider found')
  }

  return context
}

/**
 * Hook that retrieves the current combobox value.
 *
 * @returns An object containing:
 * - `search`: The current search query.
 * - `group`: The currently selected group.
 * - `groups`: The list of all available groups.
 */
const useComboboxValue = () => {
  const store = useComboboxContext()
  return useStore(
    store,
    useShallow((state) => ({
      search: state.search,
      group: state.groups.find((group) => group.name === state.currentGroup),
      groups: state.groups,
    })),
  )
}

/**
 * Hook that provides functions to update the combobox state.
 *
 * @returns An object containing:
 * - `setSearch`: Function to update the search query.
 * - `setCurrentGroup`: Function to update the current group.
 */
const useComboboxUpdater = () => {
  const store = useComboboxContext()
  return useStore(
    store,
    useShallow((state) => ({
      setSearch: state.setSearch,
      setCurrentGroup: state.setCurrentGroup,
    })),
  )
}

/**
 * Hook that facilitates registering and unregistering combobox groups.
 *
 * @returns An object containing:
 * - `registerGroup`: Function to register a new group.
 * - `unregisterGroup`: Function to unregister an existing group.
 */
const useComboboxGroupHandler = () => {
  const store = useComboboxContext()

  const registerGroup = (newGroup: ComboboxGroup) => {
    const state = store.getState()
    let newGroups: ComboboxGroup[] = []
    const index = state.groups.findIndex(
      (group) => group.name === newGroup.name,
    )

    if (index !== -1) {
      newGroups = [...state.groups]
      newGroups[index] = newGroup
    } else {
      newGroups = [...state.groups, newGroup]
    }

    state.setGroups(newGroups)

    // If there is no current group, set it to the newly registered group
    if (!state.currentGroup) {
      state.setCurrentGroup(newGroup.name)
    }
  }

  const unregisterGroup = (name: string) => {
    const state = store.getState()
    const newGroups = state.groups.filter((group) => group.name !== name)
    state.setGroups(newGroups)

    // If the current group is being unregistered, reset it
    if (state.currentGroup === name) {
      state.setCurrentGroup(state.groups.at(0)?.name)
    }
  }

  return { registerGroup, unregisterGroup }
}

export {
  ComboboxContextProvider,
  useComboboxValue,
  useComboboxUpdater,
  useComboboxGroupHandler,
}
