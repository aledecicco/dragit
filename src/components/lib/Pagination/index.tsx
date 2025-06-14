import type { ComponentProps } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import { Button, type ButtonProps } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

interface PaginationProps extends ComponentProps<'div'> {
  /**
   * The current 0-indexed page number.
   */
  page: number

  /**
   * The number of items per page.
   */
  pageSize: number

  /**
   * Whether there is a next page available.
   */
  hasNext: boolean

  /**
   * Callback to move to the previous page.
   */
  setPrevPage: () => void

  /**
   * Callback to move to the next page.
   */
  setNextPage: () => void

  /**
   * Additional props for the buttons, shared between both of them.
   */
  buttonProps?: Partial<ButtonProps>
}

/**
 * Displays controls for paginated data, allowing navigation between pages.
 */
const Pagination = (props: PaginationProps) => {
  const {
    page,
    pageSize,
    hasNext,
    setPrevPage,
    setNextPage,
    buttonProps,
    ...divProps
  } = props

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
        {...buttonProps}
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
        {...buttonProps}
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
