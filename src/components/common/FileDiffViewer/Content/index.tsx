import type { ComponentProps } from 'react'

import type {
  FileDiff,
  VersionedFileInfo,
  WorktreeFileInfo,
} from '@/api/models'
import { highlightDiff } from '@/utils/highlighting'
import { cn, propsWithCn } from '@/utils/styles'

interface DiffViewerContentProps extends ComponentProps<'div'> {
  /**
   * The file being diffed.
   */
  file: WorktreeFileInfo | VersionedFileInfo

  /**
   * The diff to display.
   */
  fileDiff: FileDiff
}

/**
 * Displays the contents of a file in a diff viewer.
 */
const DiffViewerContent = (props: DiffViewerContentProps) => {
  const { file, fileDiff, ...divProps } = props
  return (
    <div
      {...propsWithCn(
        divProps,
        'overflow-x-auto overflow-y-hidden',
        'col-start-1 -col-end-1',
      )}
    >
      <div
        className={cn(
          'w-max min-w-full pl-2',
          'whitespace-pre font-mono leading-7',
        )}
      >
        {fileDiff.length === 0 ? (
          <p className={cn('text-light-950/50 italic')}>Empty file</p>
        ) : (
          highlightDiff(fileDiff, file.path)
        )}
      </div>
    </div>
  )
}

export { DiffViewerContent, type DiffViewerContentProps }
