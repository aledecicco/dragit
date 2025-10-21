import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { DiffScope } from '@/api/models'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { cn } from '@/utils/styles'

import { FileViewerContainer } from '../Container'
import { FileViewerContent } from '../Content'
import { getLineIndicators } from '../LineIndicator'
import { getLineNumbers } from '../LineNumber'
import { type DiffFilter, highlightDiff } from './utils'

interface FileDiffViewerProps extends ComponentProps<'div'> {
  /**
   * The scope of the diff to display (staged changes, unstaged changes, or a specific snapshot).
   */
  diffScope: DiffScope

  /**
   * An optional filter to apply to the displayed diff lines.
   */
  filter?: DiffFilter
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { diffScope, filter = 'both', ...divProps } = props

  const fileDiffQuery = useQueryFileDiff(diffScope)
  const fileStageAnnotation =
    diffScope.type === 'unmerged'
      ? match(diffScope.stage)
          .with('ours', () => ' (ours)')
          .with('theirs', () => ' (theirs)')
          .exhaustive()
      : match(filter)
          .with('ours', () => ' (after changes)')
          .with('theirs', () => ' (before changes)')
          .with('both', () => undefined)
          .exhaustive()

  return (
    <FileViewerContainer
      {...divProps}
      query={fileDiffQuery}
      filepath={diffScope.file.path}
      annotation={fileStageAnnotation}
    >
      {(fileDiff) => (
        <>
          <div className={cn('col-start-1 flex flex-col select-none')}>
            {getLineNumbers(fileDiff, filter)}
          </div>

          <div className={cn('col-start-2 flex flex-col select-none')}>
            {getLineIndicators(fileDiff, filter)}
          </div>

          <FileViewerContent className={cn('col-start-3')}>
            {highlightDiff(fileDiff, diffScope.file.path, filter)}
          </FileViewerContent>
        </>
      )}
    </FileViewerContainer>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }
