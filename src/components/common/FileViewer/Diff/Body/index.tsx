import type { DiffScope } from '@/api/models'
import { useQueryHighlightedDiff } from '@/api/queries/highlightedDiff'
import type { DiffFilter } from '@/highlighting/utils'
import { useSettings } from '@/state/storage'

import { FileViewerBody } from '../../common/Body'

interface FileDiffViewerBodyProps {
  /**
   * The scope of the diff to display.
   */
  diffScope: DiffScope

  /**
   * A filter to apply to the displayed diff lines.
   */
  filter: DiffFilter

  /**
   * The path of the file being diffed.
   */
  filepath: string
}

/**
 * Highlights a file diff, and displays the result.
 */
const FileDiffViewerBody = (props: FileDiffViewerBodyProps) => {
  const { diffScope, filter, filepath } = props

  const { showWordDiffs } = useSettings()
  const highlightedQuery = useQueryHighlightedDiff(
    diffScope,
    filepath,
    filter,
    showWordDiffs,
  )

  return <FileViewerBody query={highlightedQuery} />
}

export { FileDiffViewerBody, type FileDiffViewerBodyProps }
