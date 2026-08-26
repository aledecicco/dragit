import type { UnmergedFileInfo } from '@/api/models'
import { useQueryHighlightedConflicts } from '@/api/queries/highlightedConflicts'
import { FileIcon } from '@/common/File/Icon'
import { FileStatus } from '@/common/File/Status'
import { useSettings } from '@/state/storage'

import { FileViewerBody } from '../common/Body'
import {
  FileViewerContainer,
  type FileViewerContainerProps,
} from '../common/Container'
import { FileViewerGate, useFileConflictsGate } from '../common/Gate'

interface FileConflictViewerProps extends Partial<FileViewerContainerProps> {
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

  const { showWordDiffs } = useSettings()

  const gate = useFileConflictsGate(file)

  const highlightedQuery = useQueryHighlightedConflicts(
    file,
    showWordDiffs,
    gate.status === 'allowed',
  )

  return (
    <FileViewerContainer
      {...containerProps}
      content={highlightedQuery.data}
      filepath={file.path}
      decoration={<FileIcon file={file} size="lg" />}
      annotation={<FileStatus file={file} />}
    >
      <FileViewerGate gate={gate}>
        <FileViewerBody query={highlightedQuery} />
      </FileViewerGate>
    </FileViewerContainer>
  )
}

export { FileConflictViewer, type FileConflictViewerProps }
