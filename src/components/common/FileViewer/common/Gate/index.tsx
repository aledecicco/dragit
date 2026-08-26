import { type PropsWithChildren, useState } from 'react'

import type { DiffScope, UnmergedFileInfo } from '@/api/models'
import { useQueryFileConflicts } from '@/api/queries/fileConflicts'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { useSettings } from '@/state/storage'
import { Button } from '@/ui/Button'
import { cn } from '@/utils/styles'

export const LARGE_FILE_THRESHOLD = 20000

type FileViewerGateStatus = 'pending' | 'blocked' | 'allowed'

interface FileViewerGateState {
  /**
   * Whether the contents may be highlighted and displayed.
   */
  status: FileViewerGateStatus

  /**
   * Allows the contents to be displayed regardless of their size.
   */
  showAnyway: () => void
}

interface FileViewerGateProps extends PropsWithChildren {
  /**
   * The state of the gate, as tracked by {@link useFileViewerGate}.
   */
  gate: FileViewerGateState
}

/**
 * Holds off displaying the contents of very large files until asked to.
 */
const FileViewerGate = (props: FileViewerGateProps) => {
  const { gate, children } = props

  if (gate.status !== 'blocked') {
    return children
  }

  return (
    <div
      className={cn('col-start-1 -col-end-1', 'flex flex-col gap-2 p-4 h-max')}
    >
      <p className={cn('text-sm text-light-950 select-none')}>
        This file is too large to display.
      </p>
      <Button
        className={cn('w-max')}
        status="neutral"
        variant="filled"
        size="sm"
        onClick={() => {
          gate.showAnyway()
        }}
      >
        Show anyway
      </Button>
    </div>
  )
}

/**
 * Decides whether contents of the given size should be displayed.
 *
 * @param lineCount - The number of lines the file holds, once known.
 */
const useLineCountGate = (
  lineCount: number | undefined,
): FileViewerGateState => {
  const { showLargeDiffs } = useSettings()
  const [showAnyway, setShowAnyway] = useState(false)

  return {
    status:
      lineCount === undefined
        ? 'pending'
        : lineCount > LARGE_FILE_THRESHOLD && !showLargeDiffs && !showAnyway
          ? 'blocked'
          : 'allowed',
    showAnyway: () => {
      setShowAnyway(true)
    },
  }
}

/**
 * Decides whether the diff of a file should be displayed.
 *
 * @param scope - The scope of the diff to display.
 */
const useFileDiffGate = (scope: DiffScope): FileViewerGateState => {
  const fileDiffQuery = useQueryFileDiff(scope)

  return useLineCountGate(fileDiffQuery.data?.length)
}

/**
 * Decides whether the conflicts of a file should be displayed.
 *
 * @param file - The conflicted file to display.
 */
const useFileConflictsGate = (file: UnmergedFileInfo): FileViewerGateState => {
  const fileConflictsQuery = useQueryFileConflicts(file)

  return useLineCountGate(fileConflictsQuery.data?.length)
}

export {
  FileViewerGate,
  type FileViewerGateProps,
  type FileViewerGateState,
  useFileConflictsGate,
  useFileDiffGate,
}
