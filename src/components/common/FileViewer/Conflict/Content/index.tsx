import { useState } from 'react'

import type { FileConflicts } from '@/api/models'
import { useSettings } from '@/state/storage'
import { Button } from '@/ui/Button'
import { cn } from '@/utils/styles'

import { FileViewerContent } from '../../common/Content'
import { LARGE_DIFF_THRESHOLD } from '../../Diff'
import { highlightConflicts } from '../utils'
import { getLineIndicators, getLineNumbers } from './utils'

interface FileConflictViewerContentProps {
  /**
   * The file conflicts to display.
   */
  fileConflicts: FileConflicts

  /**
   * The path of the conflicted file.
   */
  filepath: string
}

/**
 * Displays the actual conflicts of a file.
 * If the diff is too large, it shows a warning message and a button to show the diff anyway.
 */
const FileConflictViewerContent = (props: FileConflictViewerContentProps) => {
  const { fileConflicts, filepath } = props

  const { showLargeDiffs } = useSettings()
  const [showAnyway, setShowAnyway] = useState(showLargeDiffs)

  return fileConflicts.length > LARGE_DIFF_THRESHOLD && !showAnyway ? (
    <div className={cn('flex flex-col gap-2 p-4')}>
      <p className={cn('text-sm text-light-950 select-none')}>
        This diff is too large to display.
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
  ) : (
    <>
      <div className={cn('col-start-1 flex flex-col select-none')}>
        {getLineNumbers(fileConflicts)}
      </div>

      <div className={cn('col-start-2 flex flex-col select-none')}>
        {getLineIndicators(fileConflicts)}
      </div>

      <FileViewerContent className={cn('col-start-3')}>
        {highlightConflicts(fileConflicts, filepath)}
      </FileViewerContent>
    </>
  )
}

export { FileConflictViewerContent, type FileConflictViewerContentProps }
