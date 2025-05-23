import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { type ComponentProps, useMemo } from 'react'
import { usePrevious } from 'react-use'

import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface PaginationProps extends ComponentProps<'div'> {
  page: number
  pageSize: number
  hasNext: boolean
  setPrevPage: () => void
  setNextPage: () => void
}

const Pagination = (props: PaginationProps) => {
  const { page, pageSize, hasNext, setPrevPage, setNextPage, ...divProps } =
    props

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-row gap-x-1 items-center justify-center',
      )}
    >
      <Button
        size="sm"
        round
        variant="filled"
        status="neutral"
        description="Previous page"
        disabled={page === 0}
        onClick={() => {
          setPrevPage()
        }}
      >
        <Icon Glyph={IconChevronLeft} size="sm" />
      </Button>
      <span className={cn('text-xs text-nowrap text-light-950')}>
        {`${page * pageSize + 1} - ${(page + 1) * pageSize}`}
      </span>
      <Button
        size="sm"
        round
        variant="filled"
        status="neutral"
        description="Next page"
        disabled={!hasNext}
        onClick={() => {
          setNextPage()
        }}
      >
        <Icon Glyph={IconChevronRight} size="sm" />
      </Button>
    </div>
  )
}

export { Pagination, type PaginationProps }
