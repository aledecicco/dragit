import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import type { FileInfo, Page } from '@api/models'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
} from '@context/files'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { cn } from '@utils/styles'

interface FileStatusListPaginationProps<T extends FileInfo> {
  type: FileType
  files: Page<T> | undefined
}

const FileStatusListPagination = <T extends FileInfo>(
  props: FileStatusListPaginationProps<T>,
) => {
  const { type, files } = props
  const page = useFilesPage(type)

  if (page === 0 && files && !files.hasNext) {
    return
  }

  return (
    <div className={cn('flex flex-row gap-0.5 items-center')}>
      <Button
        size="sm"
        round
        variant="neutral"
        aria-label={`Previous page of ${type} files`}
        disabled={!files || page === 0}
        onClick={() => {
          setPrevPage(type)
        }}
      >
        <Icon Glyph={IconChevronLeft} size="sm" />
      </Button>
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
  )
}

export { FileStatusListPagination, type FileStatusListPaginationProps }
