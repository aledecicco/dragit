import type { UnmergedFileInfo } from '@/api/models'
import { useQueryHighlightedConflicts } from '@/api/queries/highlightedConflicts'

import { FileViewerBody } from '../../common/Body'

interface FileConflictViewerBodyProps {
  /**
   * The conflicted file to display.
   */
  file: UnmergedFileInfo
}

/**
 * Highlights a file's conflicts, and displays the result.
 */
const FileConflictViewerBody = (props: FileConflictViewerBodyProps) => {
  const { file } = props

  const highlightedQuery = useQueryHighlightedConflicts(file)

  return <FileViewerBody query={highlightedQuery} />
}

export { FileConflictViewerBody, type FileConflictViewerBodyProps }
