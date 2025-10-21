import type { ComponentProps } from 'react'

import type { UnmergedFileInfo } from '@/api/models'
import { useQueryFileConflicts } from '@/api/queries/fileConflicts'
import { cn } from '@/utils/styles'

import { FileViewerContainer } from '../Container'
import { FileViewerContent } from '../Content'
import { getLineIndicators } from '../LineIndicator'
import { getLineNumbers } from '../LineNumber'
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

export { FileConflictViewer, type FileConflictViewerProps }
