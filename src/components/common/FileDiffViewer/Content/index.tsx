import type { ComponentProps } from 'react'

import type {
  FileDiff,
  VersionedFileInfo,
  WorktreeFileInfo,
} from '@/api/models'
import { type DiffFilter, highlightDiff } from '@/common/FileDiffViewer/utils'
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

  /**
   * A filter indicating which parts of the diff to show the contents for.
   */
  filter: DiffFilter
}

/**
 * Displays the contents of a file in a diff viewer.
 */
const DiffViewerContent = (props: DiffViewerContentProps) => {
  const { file, fileDiff, filter, ...divProps } = props
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
        {highlightDiff(fileDiff, file.path, filter)}
      </div>
    </div>
  )
}

export { DiffViewerContent, type DiffViewerContentProps }
