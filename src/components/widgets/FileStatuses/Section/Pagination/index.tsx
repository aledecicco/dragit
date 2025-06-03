import type { UseQueryResult } from '@tanstack/react-query'

import type { FileTypes, Page } from '@api/models'
import { FILE_STATUSES_PAGE_SIZE } from '@api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
  useNeedsPagination,
} from '@context/pages'
import { Pagination } from '@lib/Pagination'
import { Chip } from '@ui/Chip'

interface FileStatusSectionPaginationProps<T extends FileType> {
  /**
   * The status of the files being displayed.
   */
  type: T

  /**
   * The query that returns (a page of) the files of the specified type.
   */
  query: UseQueryResult<Page<FileTypes[T]>>
}

/**
 * Pagination controls for a file statuses section.
 * Falls back to displayinh the number of items if pagination is not needed.
 */
const FileStatusSectionPagination = <T extends FileType>(
  props: FileStatusSectionPaginationProps<T>,
) => {
  const { type, query } = props
  const page = useFilesPage(type)

  const showPagination = useNeedsPagination(query, page)

  return showPagination ? (
    <Pagination
      page={page}
      pageSize={FILE_STATUSES_PAGE_SIZE}
      hasNext={!!query.data?.hasNext}
      setPrevPage={() => {
        setPrevPage(type)
      }}
      setNextPage={() => {
        setNextPage(type)
      }}
    />
  ) : (
    <Chip size="sm">{query.data?.items.length ?? '...'}</Chip>
  )
}

export { FileStatusSectionPagination, type FileStatusSectionPaginationProps }
