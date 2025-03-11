import { Store } from '@tanstack/react-store'
import { useState } from 'react'

interface Ids {
  nextId: number
}

const ids = new Store<Ids>({
  nextId: 0,
})

const getUniqueId = () => {
  const id = ids.state.nextId
  ids.setState((ids) => ({ ...ids, nextId: ids.nextId + 1 }))

  return id.toString(16)
}

const useUniqueId = () => {
  const [id] = useState(getUniqueId())

  return id
}

export { getUniqueId, useUniqueId }
