import { useQuery } from '@tanstack/react-query'
import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import { currentDirQuery } from '@api/queries'

interface CurrentDirectory {
  path: string | undefined
}

const currentDirectory = new Store<CurrentDirectory>({
  path: undefined,
})

const useDirectoryIsOpen = () => {
  const currentDir = useStore(currentDirectory)
  return !!currentDir.path
}

const useCurrentDirectory = () => {
  const currentDir = useStore(currentDirectory)

  if (currentDir.path === undefined) {
    throw new Error('No directory selected')
  }

  return currentDir.path
}
const useDirectorySync = () => {
  const currentDir = useQuery(currentDirQuery)

  useEffect(() => {
    currentDirectory.setState(() => ({ path: currentDir.data }))
  }, [currentDir.data])
}

export { useCurrentDirectory, useDirectoryIsOpen, useDirectorySync }
