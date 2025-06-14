import { useState } from 'react'
import { Store } from '@tanstack/react-store'

interface Ids {
  nextId: number
}

const ids = new Store<Ids>({
  nextId: 0,
})

/**
 * Generates a new unique ID in hexadecimal format.
 */
const getUniqueId = () => {
  const id = ids.state.nextId
  ids.setState((ids) => ({
    ...ids,
    nextId: (ids.nextId + 1) % Number.MAX_SAFE_INTEGER,
  }))

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
