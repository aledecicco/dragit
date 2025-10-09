import { useEffect } from 'react'
import { Store, useStore } from '@tanstack/react-store'

import type { WorktreeFileType } from '@/api/models'
import { useQueryWorktreeFiles } from '@/api/queries'
import { getFileTypeFilter } from '@/api/utils'
import { useHandlePageSync } from '@/utils/pagination'

type FilePages = Map<string, number>
const filesPages = new Store<FilePages>(new Map())

const getMapKey = (types: WorktreeFileType | WorktreeFileType[]): string =>
  JSON.stringify(getFileTypeFilter(types))

const useWorktreeFilesPages = () => useStore(filesPages)

/**
 * Returns the page that the application is currently on for the given file types.
 * Defaults to 0.
 *
 * @param types - The set of file types being paginated.
 */
const useWorktreeFilesPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  const pages = useWorktreeFilesPages()

  const key = getMapKey(types)
  const page = pages.get(key)

  return page ?? 0
}

/**
 * Clears the current page for the given file types, resetting it to 0.
 *
 * @param types - The set of file types to clear the page for.
 */
const clearPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, 0)
    return newState
  })
}

/**
 * Changes the current page for the given file types to the next one.
 *
 * @param types - The set of file types to change the page for.
 */
const setNextPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, (newState.get(key) ?? 0) + 1)
    return newState
  })
}

/**
 * Changes the current page for the given file types to the previous one.
 *
 * @param types - The set of file types to change the page for.
 */
const setPrevPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  filesPages.setState((state) => {
    const key = getMapKey(types)
    const newState = new Map(state)
    newState.set(key, Math.max(0, (newState.get(key) ?? 0) - 1))
    return newState
  })
}

/**
 * Hook that clears the current page for a given set of file types if their corresponding query has no data.
 *
 * @param types - The set of file types to check.
 * @param pathspec - An optional pathspec to filter the files.
 */
const useHandleFilesPageSync = (
  types: WorktreeFileType | WorktreeFileType[],
  pathspec?: string,
) => {
  const filesQuery = useQueryWorktreeFiles(types, pathspec)
  const page = useWorktreeFilesPage(types)
  const clear = () => {
    clearPage(types)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: clear page when search changes
  useEffect(() => {
    clearPage(types)
  }, [types, pathspec, clearPage])
  useHandlePageSync(filesQuery, page, clear)
}

export {
  useWorktreeFilesPage as useFilesPage,
  setNextPage,
  setPrevPage,
  clearPage,
  type useHandlePageSync,
  useHandleFilesPageSync,
  type WorktreeFileType as FileType,
}
