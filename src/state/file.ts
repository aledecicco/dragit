import { useEffect } from 'react'
import { match, P } from 'ts-pattern'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/Staged'

import type { WorktreeFileInfo } from '@/api/models'
import { useQueryWorktreeFiles } from '@/api/queries/worktreeFiles'

interface FileDiffs {
  /**
   * The currently open file diff.
   */
  selected: WorktreeFileInfo | undefined
}

interface Setters {
  /**
   * Sets the currently open file diff.
   */
  setSelected: (file: WorktreeFileInfo | undefined) => void
}

const useFileDiffsStore = create<FileDiffs & Setters>()(
  immer((setState) => ({
    selected: undefined,

    setSelected: (file) => {
      setState((state) => {
        state.selected = file
      })
    },
  })),
)

/**
 * Change the currently selected file diff.
 */
const changeSelectedFile = (file: WorktreeFileInfo | undefined) => {
  const state = useFileDiffsStore.getState()
  state.setSelected(file)
}

/**
 * Hook that facilitates tracking the selected file diff.
 */
const useSelectedFile = (): WorktreeFileInfo | undefined => {
  const selectedFile = useFileDiffsStore(useShallow((state) => state.selected))
  return selectedFile
}

/**
 * Hook that keeps the stored file diffs in sync when the worktree state changes.
 */
const useFileDiffsSync = () => {
  const notStagedFilesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)
  const stagedFilesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)

  useEffect(() => {
    const store = useFileDiffsStore.getState()
    const selectedFile = store.selected

    if (!selectedFile) {
      return
    }

    match(selectedFile)
      .with({ status: P.union(...STAGED_FILE_TYPES) }, (file) => {
        const stillExists = stagedFilesQuery.data?.items.some(
          (f) => f.path === file.path && f.status === file.status,
        )

        if (!stillExists) {
          store.setSelected(undefined)
        }
      })
      .with({ status: P.union(...NOT_STAGED_FILE_TYPES) }, (file) => {
        const stillExists = notStagedFilesQuery.data?.items?.some(
          (f) => f.path === file.path && f.status === file.status,
        )

        if (!stillExists) {
          store.setSelected(undefined)
        }
      })
      .exhaustive()
  }, [notStagedFilesQuery.data, stagedFilesQuery.data])
}

export { changeSelectedFile, useSelectedFile, useFileDiffsSync }
