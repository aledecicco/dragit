import type { ComponentProps, ReactNode } from 'react'
import { match, P } from 'ts-pattern'

import type { DiffScope, FileDiff } from '@/api/models'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { FileIcon } from '@/common/File/Icon'
import { FileStatus } from '@/common/File/Status'
import { cn } from '@/utils/styles'

import { FileViewerContainer } from '../common/Container'
import { FileViewerContent } from '../common/Content'
import { LineIndicator } from '../common/LineIndicator'
import { LineNumber } from '../common/LineNumber'
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
          .with('ours', () => (
            <span className={cn('text-primary-500')}>Ours</span>
          ))
          .with('theirs', () => (
            <span className={cn('text-warning-500')}>Theirs</span>
          ))
          .exhaustive()
      : match(filter)
          .with('ours', () => 'After changes')
          .with('theirs', () => 'Before changes')
          .with('both', () =>
            'changes' in diffScope.file &&
            diffScope.file.changes === 'renamed' ? (
              `Moved from ./${diffScope.file.oldPath}`
            ) : (
              <FileStatus file={diffScope.file} />
            ),
          )
          .exhaustive()

  const filepath =
    diffScope.type === 'unmerged'
      ? diffScope.file.path
      : match(filter)
          .with('theirs', () =>
            'changes' in diffScope.file && diffScope.file.changes === 'renamed'
              ? diffScope.file.oldPath
              : diffScope.file.path,
          )
          .otherwise(() => diffScope.file.path)

  return (
    <FileViewerContainer
      {...divProps}
      query={fileDiffQuery}
      decoration={<FileIcon file={diffScope.file} size="lg" />}
      filepath={filepath}
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
            {highlightDiff(fileDiff, filepath, filter)}
          </FileViewerContent>
        </>
      )}
    </FileViewerContainer>
  )
}

/**
 * Generates the line indicators for a given file diff.
 */
const getLineIndicators = (
  content: FileDiff,
  filter: DiffFilter,
): ReactNode => {
  const res: ReactNode[] = []

  content.forEach((line, i) => {
    const show = match([filter, line.type])
      .with(['both', P._], () => true)
      .with(['ours', P.select()], (lineType) => lineType !== 'removed')
      .with(['theirs', P.select()], (lineType) => lineType !== 'added')
      .exhaustive()

    if (show) {
      res.push(<LineIndicator key={`${i + 1}`} type={line.type} />)
    }
  })

  res.push(<LineIndicator type="unchanged" className={cn('grow')} empty />)

  return res
}

/**
 * Generates the line numbers for a given file diff.
 *
 * In inline mode, staggers line numbers when there's a sequence of deletions to keep them aligned
 * with the actual lines in the resulting file.
 */
const getLineNumbers = (
  content: FileDiff,
  filter: DiffFilter = 'both',
): ReactNode => {
  const res: ReactNode[] = []

  let offset = 0
  let ignored = 0
  let deletions = 0

  content.forEach((line, i) => {
    match(filter)
      .with('both', () => {
        if (line.type === 'removed') {
          deletions++
        } else if (deletions > 0) {
          offset -= deletions
          deletions = 0
        }

        res.push(
          <LineNumber
            key={`${i + 1}`}
            type={line.type}
            lineNumber={i + 1 + offset}
          />,
        )
      })
      .with('ours', () => {
        if (line.type !== 'removed') {
          res.push(
            <LineNumber
              key={`${i + 1}`}
              type={line.type}
              lineNumber={i + 1 - ignored}
            />,
          )
        } else {
          ignored++
        }
      })
      .with('theirs', () => {
        if (line.type !== 'added') {
          res.push(
            <LineNumber
              key={`${i + 1}`}
              type={line.type}
              lineNumber={i + 1 - ignored}
            />,
          )
        } else {
          ignored++
        }
      })
      .exhaustive()
  })

  res.push(
    <LineNumber
      key={content.length + 1}
      type="unchanged"
      className={cn('grow rounded-bl-sm')}
      lineNumber={content.length + 1 + offset - ignored}
      faded
    />,
  )

  return res
}

export { FileDiffViewer, type FileDiffViewerProps }
