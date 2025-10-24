import type { ComponentProps, ReactNode } from 'react'
import { match } from 'ts-pattern'

import type {
  ConflictType,
  FileConflicts,
  UnmergedFileInfo,
} from '@/api/models'
import { useQueryFileConflicts } from '@/api/queries/fileConflicts'
import { cn } from '@/utils/styles'

import { FileViewerContainer } from '../common/Container'
import { FileViewerContent } from '../common/Content'
import { LineIndicator } from '../common/LineIndicator'
import { LineNumber } from '../common/LineNumber'
import { highlightConflicts } from './utils'

interface FileConflictViewerProps extends ComponentProps<'div'> {
  file: UnmergedFileInfo
}

/**
 * Displays the conflicted version of an unmerged file, showing both sides.
 */
const FileConflictViewer = (props: FileConflictViewerProps) => {
  const { file, ...divProps } = props

  const fileConflictsQuery = useQueryFileConflicts(file)

  return (
    <FileViewerContainer
      {...divProps}
      query={fileConflictsQuery}
      filepath={file.path}
      annotation={match(file.changes)
        .with('bothAdded', () => '(added by both)')
        .with('bothDeleted', () => '(deleted by both)')
        .with('bothModified', () => '(modified by both)')
        .with('addedByUs', () => '(added by us)')
        .with('deletedByUs', () => '(deleted by us)')
        .with('addedByThem', () => '(added by them)')
        .with('deletedByThem', () => '(deleted by them)')
        .exhaustive()}
    >
      {(fileConflicts) => (
        <>
          <div className={cn('col-start-1 flex flex-col select-none')}>
            {getLineNumbers(fileConflicts)}
          </div>

          <div className={cn('col-start-2 flex flex-col select-none')}>
            {getLineIndicators(fileConflicts)}
          </div>

          <FileViewerContent className={cn('col-start-3')}>
            {highlightConflicts(fileConflicts, file.path)}
          </FileViewerContent>
        </>
      )}
    </FileViewerContainer>
  )
}

/**
 * Generates the line indicators for a given file conflict.
 *
 * Adds empty indicators when switching between conflict sections.
 */
const getLineIndicators = (content: FileConflicts): ReactNode => {
  const res: ReactNode[] = []
  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    if (sectionType !== line.type && line.type !== 'unchanged') {
      res.push(
        <LineIndicator
          key={`indicator-${i + 1}`}
          type={line.type}
          className="h-4.5"
          empty
        />,
      )
    }

    res.push(<LineIndicator key={`${i + 1}`} type={line.type} />)
    sectionType = line.type
  })

  res.push(<LineIndicator type="unchanged" className={cn('grow')} empty />)

  return res
}

/**
 * Generates the line numbers for a given file conflict.
 *
 * Adds empty cells when switching between conflict sections.
 */
const getLineNumbers = (content: FileConflicts): ReactNode => {
  const res: ReactNode[] = []

  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    if (sectionType !== line.type && line.type !== 'unchanged') {
      res.push(
        <LineNumber
          key={`indicator-${i + 1}`}
          type={line.type}
          className="h-4.5"
          lineNumber={undefined}
        />,
      )
    }

    res.push(
      <LineNumber key={`${i + 1}`} type={line.type} lineNumber={i + 1} />,
    )
    sectionType = line.type
  })

  res.push(
    <LineNumber
      key={`${content.length + 1}`}
      type="unchanged"
      className={cn('grow rounded-bl-sm')}
      lineNumber={content.length + 1}
      faded
    />,
  )

  return res
}

export { FileConflictViewer, type FileConflictViewerProps }
