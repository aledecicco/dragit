import type { ComponentProps } from 'react'

import type { FileDiff } from '@/api/models'
import { highlightDiff } from '@/utils/highlighting'
import { cn, propsWithCn } from '@/utils/styles'

interface DiffViewerContentProps extends ComponentProps<'div'> {
  /**
   * The full path of the file being diffed.
   */
  filepath: string

  /**
   * The diff to display.
   */
  fileDiff: FileDiff
}

/**
 * Displays the contents of a file in a diff viewer.
 */
const DiffViewerContent = (props: DiffViewerContentProps) => {
  const { filepath, fileDiff, ...divProps } = props
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
          'w-max min-w-full pl-2 pr-3',
          'whitespace-pre font-mono leading-7',
        )}
      >
        {highlightDiff(fileDiff, filepath)}
      </div>
    </div>
  )
}

export { DiffViewerContent, type DiffViewerContentProps }
