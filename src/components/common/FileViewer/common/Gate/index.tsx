import { type PropsWithChildren, useState } from 'react'

import { useSettings } from '@/state/storage'
import { Button } from '@/ui/Button'
import { cn } from '@/utils/styles'

/**
 * The number of lines past which a file is considered too large.
 */
export const LARGE_FILE_THRESHOLD = 20000

interface FileViewerGateProps extends PropsWithChildren {
  /**
   * The number of lines the file holds.
   */
  lineCount: number
}

/**
 * Holds off displaying the contents of very large files until asked to.
 */
const FileViewerGate = (props: FileViewerGateProps) => {
  const { lineCount, children } = props

  const { showLargeDiffs } = useSettings()
  const [showAnyway, setShowAnyway] = useState(showLargeDiffs)

  if (lineCount <= LARGE_FILE_THRESHOLD || showAnyway) {
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
          setShowAnyway(true)
        }}
      >
        Show anyway
      </Button>
    </div>
  )
}

export { FileViewerGate, type FileViewerGateProps }
