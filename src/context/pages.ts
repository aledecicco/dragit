import { useEffect } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { FileTypeFilter, WorktreeFileType } from '@/api/models'
import { useQueryWorktreeFiles } from '@/api/queries/worktreeFiles'
import { getFileTypeFilter, useHandlePageSync } from '@/api/utils'

interface FilePages {
  /**
   * A map from file types to page numbers.
   */
  worktree: Map<FileTypeFilter, number>
}

interface Setters {
  /**
   * Sets the current page for a given set of file types.
   *
   * @param types - The set of file types being paginated.
   * @param page - The new page number to set. If `undefined`, the page will be cleared.
   */
  setPage: (
    types: WorktreeFileType | WorktreeFileType[],
    page: number | undefined,
  ) => void
}

const useFilesPagesStore = create<FilePages & Setters>()(
  immer((setState) => ({
    worktree: new Map(),

    setPage: (types, page) => {
      setState((state) => {
        const key = getFileTypeFilter(types)
        if (page === undefined) {
          state.worktree.delete(key)
        } else {
          state.worktree.set(key, page)
        }
      })
    },
  })),
)

/**
 * Returns the page that the application is currently on for the given file types.
 * Defaults to 0.
 *
 * @param types - The set of file types being paginated.
 */
const useWorktreeFilesPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  return useFilesPagesStore((state) => {
    const key = getFileTypeFilter(types)
    return state.worktree.get(key) ?? 0
  })
}

/**
 * Clears the current page for the given file types, resetting it to 0.
 *
 * @param types - The set of file types to clear the page for.
 */
const clearPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  const store = useFilesPagesStore.getState()
  store.setPage(types, undefined)
}

/**
 * Changes the current page for the given file types to the next one.
 *
 * @param types - The set of file types to change the page for.
 */
const setNextPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  const store = useFilesPagesStore.getState()
  const key = getFileTypeFilter(types)
  store.setPage(types, (store.worktree.get(key) ?? 0) + 1)
}

/**
 * Changes the current page for the given file types to the previous one.
 *
 * @param types - The set of file types to change the page for.
 */
const setPrevPage = (types: WorktreeFileType | WorktreeFileType[]) => {
  const store = useFilesPagesStore.getState()
  const key = getFileTypeFilter(types)
  store.setPage(types, Math.max(0, (store.worktree.get(key) ?? 0) - 1))
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
  useWorktreeFilesPage,
  setNextPage,
  setPrevPage,
  clearPage,
  useHandleFilesPageSync,
}
