import type { FileConflicts, UnmergedFileInfo } from '@/api/models'
import { useQueryFileConflicts } from '@/api/queries/fileConflicts'
import { FileIcon } from '@/common/File/Icon'
import { FileStatus } from '@/common/File/Status'

import {
  FileViewerContainer,
  type FileViewerContainerProps,
} from '../common/Container'
import { FileViewerGate } from '../common/Gate'
import { FileConflictViewerBody } from './Body'

interface FileConflictViewerProps
  extends Partial<FileViewerContainerProps<FileConflicts>> {
  /**
   * The conflicted file to display.
   */
  file: UnmergedFileInfo
}

/**
 * Displays the conflicted version of an unmerged file, showing both sides.
 */
const FileConflictViewer = (props: FileConflictViewerProps) => {
  const { file, ...containerProps } = props

  const fileConflictsQuery = useQueryFileConflicts(file)

  return (
    <FileViewerContainer
      {...containerProps}
      query={fileConflictsQuery}
      filepath={file.path}
      decoration={<FileIcon file={file} size="lg" />}
      annotation={<FileStatus file={file} />}
    >
      {(fileConflicts) => (
        <FileViewerGate lineCount={fileConflicts.length}>
          <FileConflictViewerBody file={file} />
        </FileViewerGate>
      )}
    </FileViewerContainer>
  )
}

export { FileConflictViewer, type FileConflictViewerProps }
