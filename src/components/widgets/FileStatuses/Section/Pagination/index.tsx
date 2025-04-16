import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import type { FileTypes, Page } from '@api/models'
import { FILE_STATUSES_PAGE_SIZE } from '@api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
} from '@context/pages'
import { Button } from '@ui/Button'
import { Chip } from '@ui/Chip'
import { Icon } from '@ui/Icon'
import { cn } from '@utils/styles'

interface FileStatusSectionPaginationProps<T extends FileType> {
  type: T
  files: Page<FileTypes[T]> | undefined
}

const FileStatusSectionPagination = <T extends FileType>(
  props: FileStatusSectionPaginationProps<T>,
) => {
  const { type, files } = props
  const page = useFilesPage(type)
  console.log('a', page)
  const showPagination = !hasNoPagination(files, page)

  return showPagination ? (
    <div className={cn('flex flex-row gap-1 items-center')}>
      <Button
        size="sm"
        round
        variant="neutral"
        aria-label={`Previous page of ${type} files`}
        disabled={page === 0}
        onClick={() => {
          setPrevPage(type)
        }}
      >
        <Icon Glyph={IconChevronLeft} size="sm" />
      </Button>
      <span className={cn('text-xs text-nowrap text-light-950')}>
        {`${page * FILE_STATUSES_PAGE_SIZE + 1} - ${(page + 1) * FILE_STATUSES_PAGE_SIZE}`}
      </span>
      <Button
        size="sm"
        round
        variant="neutral"
        aria-label={`Next page of ${type} files`}
        disabled={!files || !files.hasNext}
        onClick={() => {
          setNextPage(type)
        }}
      >
        <Icon Glyph={IconChevronRight} size="sm" />
      </Button>
    </div>
  ) : (
    <Chip size="sm">{files?.items.length ?? '...'}</Chip>
  )
}

export const hasNoPagination = (
  data: Page<unknown> | undefined,
  page: number,
) => {
  return page === 0 && !data?.hasNext
}

export { FileStatusSectionPagination, type FileStatusSectionPaginationProps }
