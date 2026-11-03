import { flushSync } from 'react-dom'
import { useMedia } from 'react-use'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { useQueryStorage } from '@/api/queries/storage'

/**
 * The width below which the app is too cramped to show the two side-columns at once.
 *
 * Kept in sync with the `md-screen` breakpoint in `main.css`.
 */
const COMPACT_LAYOUT_BREAKPOINT = 1400

type SideColumn = 'left' | 'right'

interface Layout {
  /**
   * The side column shown while the compact layout is active.
   */
  sideColumn: SideColumn
}

interface Setters {
  /**
   * Sets the side column shown while the compact layout is active.
   */
  setSideColumn: (column: SideColumn) => void
}

const useLayoutStore = create<Layout & Setters>()(
  immer((setState) => ({
    sideColumn: 'left',

    setSideColumn: (column) => {
      setState((state) => {
        state.sideColumn = column
      })
    },
  })),
)

/**
 * Shows one of the side columns, hiding the other one if the compact layout is
 * active, and flushes the switch synchronously.
 */
const revealSideColumn = (column: SideColumn) => {
  if (useLayoutStore.getState().sideColumn === column) {
    return
  }

  flushSync(() => {
    useLayoutStore.getState().setSideColumn(column)
  })
}

/**
 * Hook that tracks the side column currently shown.
 */
const useSideColumn = (): SideColumn => {
  return useLayoutStore((state) => state.sideColumn)
}

/**
 * Hook that tracks whether the compact layout should be used.
 */
const useIsCompactLayout = (): boolean => {
  const storageQuery = useQueryStorage()
  const isNarrow = useMedia(`(max-width: ${COMPACT_LAYOUT_BREAKPOINT - 1}px)`)

  return !!storageQuery.data?.settings.compactLayout || isNarrow
}

export {
  COMPACT_LAYOUT_BREAKPOINT,
  revealSideColumn,
  useIsCompactLayout,
  useSideColumn,
  type SideColumn,
}
