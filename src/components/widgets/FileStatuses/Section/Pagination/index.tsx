import { FILE_STATUSES_PAGE_SIZE, useQueryFiles } from '@/api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
  useNeedsPagination,
} from '@/context/pages'
import { Pagination } from '@/lib/Pagination'
import { Chip } from '@/ui/Chip'

interface FileStatusSectionPaginationProps {
  /**
   * The status of the files being displayed.
   */
  type: FileType
}

/**
 * Pagination controls for a file statuses section.
 * Falls back to displaying the number of items if pagination is not needed.
 */
const FileStatusSectionPagination = (
  props: FileStatusSectionPaginationProps,
) => {
  const { type } = props
  const filesQuery = useQueryFiles(type)
  const page = useFilesPage(type)

  const showPagination = useNeedsPagination(filesQuery, page)

  return showPagination ? (
    <Pagination
      page={page}
      pageSize={FILE_STATUSES_PAGE_SIZE}
      hasNext={!!filesQuery.data?.hasNext}
      setPrevPage={() => {
        setPrevPage(type)
      }}
      setNextPage={() => {
        setNextPage(type)
      }}
    />
  ) : (
    <Chip size="sm">{filesQuery.data?.items.length ?? '...'}</Chip>
  )
}

export { FileStatusSectionPagination, type FileStatusSectionPaginationProps }
