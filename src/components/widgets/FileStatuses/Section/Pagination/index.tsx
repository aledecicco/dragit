import type { FileTypes, Page } from '@api/models'
import { FILE_STATUSES_PAGE_SIZE } from '@api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
} from '@context/pages'
import { Pagination, useNeedsPagination } from '@lib/Pagination'
import { Chip } from '@ui/Chip'

interface FileStatusSectionPaginationProps<T extends FileType> {
  type: T
  files: Page<FileTypes[T]> | undefined
}

const FileStatusSectionPagination = <T extends FileType>(
  props: FileStatusSectionPaginationProps<T>,
) => {
  const { type, files } = props
  const page = useFilesPage(type)

  const showPagination = useNeedsPagination(page, files?.hasNext)

  return showPagination ? (
    <Pagination
      page={page}
      pageSize={FILE_STATUSES_PAGE_SIZE}
      hasNext={!!files?.hasNext}
      setPrevPage={() => {
        setPrevPage(type)
      }}
      setNextPage={() => {
        setNextPage(type)
      }}
    />
  ) : (
    <Chip size="sm">{files?.items.length ?? '...'}</Chip>
  )
}

export { FileStatusSectionPagination, type FileStatusSectionPaginationProps }
