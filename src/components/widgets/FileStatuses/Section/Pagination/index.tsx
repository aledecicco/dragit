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
import type { UseQueryResult } from '@tanstack/react-query'
import { Chip } from '@ui/Chip'

interface FileStatusSectionPaginationProps<T extends FileType> {
  type: T
  query: UseQueryResult<Page<FileTypes[T]>>
}

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
