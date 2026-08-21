import type { UseQueryResult } from '@tanstack/react-query'

import type { HighlightedContent } from '@/highlighting/utils'
import { QueryLoader } from '@/lib/QueryLoader'

import { FileViewerLoader } from '../Loader'
import { FileViewerRows } from './Rows'

interface FileViewerBodyProps {
  /**
   * The query providing the highlighted contents to display.
   */
  query: UseQueryResult<HighlightedContent>
}

/**
 * Displays the contents of a file viewer once they have been highlighted.
 */
const FileViewerBody = (props: FileViewerBodyProps) => {
  const { query } = props

  return (
    <QueryLoader query={query} loadingFallback={<FileViewerLoader />}>
      {(content) => <FileViewerRows content={content} />}
    </QueryLoader>
  )
}

export { FileViewerBody, type FileViewerBodyProps }
