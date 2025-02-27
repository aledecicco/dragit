import { useQuery } from '@tanstack/react-query'
import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'

interface CurrentDirectory {
  path: string | undefined
}

const currentDirectory = new Store<CurrentDirectory>({
  path: undefined,
})

const useDirectoryIsOpen = () => {
  const currentDir = useStore(currentDirectory)
  return currentDir.path !== undefined
}

const useCurrentDirectory = () => {
  const currentDir = useStore(currentDirectory)

  if (currentDir.path === undefined) {
    throw new Error('No directory selected')
  }

  return currentDir.path
}

const changeDirectory = (path: string) => {
  const openFolder = useOpenFolder()
  return openFolder(path)
}

const useDirectorySync = () => {
  const currentDir = useQuery(currentDirQuery)

  useEffect(() => {
    currentDirectory.setState(() => ({ path: currentDir.data }))
  }, [currentDir.data])
}

export {
  useCurrentDirectory,
  useDirectoryIsOpen,
  changeDirectory,
  useDirectorySync,
}
