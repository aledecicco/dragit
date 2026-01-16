import { useState } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Ids {
  /**
   * The next unique ID that will be provided.
   */
  nextId: number
}

interface Setters {
  /**
   * Increments the next ID counter.
   */
  incrementId: () => void
}

const useIdsStore = create<Ids & Setters>()(
  immer((setState) => ({
    nextId: 0,

    incrementId: () => {
      setState((state) => {
        state.nextId = (state.nextId + 1) % Number.MAX_SAFE_INTEGER
      })
    },
  })),
)

/**
 * Generates a new unique ID in hexadecimal format.
 */
const getUniqueId = () => {
  const store = useIdsStore.getState()
  const id = store.nextId
  store.incrementId()

  return id.toString(16)
}

/**
 * @returns A stable unique ID.
 */
const useUniqueId = () => {
  const [id] = useState(getUniqueId())

  return id
}

export { getUniqueId, useUniqueId }
