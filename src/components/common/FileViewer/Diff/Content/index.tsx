import { useState } from 'react'

import type { FileDiff } from '@/api/models'
import { useSettings } from '@/state/storage'
import { Button } from '@/ui/Button'
import { cn } from '@/utils/styles'

import { FileViewerContent } from '../../common/Content'
import { LARGE_DIFF_THRESHOLD } from '..'
import { type DiffFilter, highlightDiff } from '../utils'
import { getLineIndicators, getLineNumbers } from './utils'

interface FileDiffViewerContentProps {
  /**
   * The file diff to display.
   */
  fileDiff: FileDiff

  /**
   * A filter to apply to the displayed diff lines.
   */
  filter: DiffFilter

  /**
   * The path of the file being diffed.
   */
  filepath: string
}

/**
 * Displays the actual diff of a file.
 * If the diff is too large, it shows a warning message and a button to show the diff anyway.
 */
const FileDiffViewerContent = (props: FileDiffViewerContentProps) => {
  const { fileDiff, filter, filepath } = props

  const { showLargeDiffs } = useSettings()
  const [showAnyway, setShowAnyway] = useState(showLargeDiffs)

  return fileDiff.length > LARGE_DIFF_THRESHOLD && !showAnyway ? (
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
        {getLineNumbers(fileDiff, filter)}
      </div>

      <div className={cn('col-start-2 flex flex-col select-none')}>
        {getLineIndicators(fileDiff, filter)}
      </div>

      <FileViewerContent className={cn('col-start-3')}>
        {highlightDiff(fileDiff, filepath, filter)}
      </FileViewerContent>
    </>
  )
}

export { FileDiffViewerContent, type FileDiffViewerContentProps }
