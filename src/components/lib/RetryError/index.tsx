import type { ComponentProps } from 'react'

import { IconReload } from '@tabler/icons-react'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface RetryErrorProps extends ComponentProps<'div'> {
  /**
   * The error message to display.
   */
  message: string

  /**
   * A callback to trigger a retry.
   */
  retry: () => void
}

/**
 * Displays an error message and a retry button.
 *
 * Useful for displaying query errors and allowing a re-fetch.
 */
const RetryError = (props: RetryErrorProps) => {
  const { message, retry, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-row gap-x-1 p-2',
        'text-sm text-danger-600',
      )}
    >
      <p>{message}</p>
      <Button
        className={cn('bg-none')}
        size="sm"
        variant="plain"
        status="error"
        round
        onClick={() => {
          retry()
        }}
      >
        <Icon Glyph={IconReload} size="sm" />
      </Button>
    </div>
  )
}

export { RetryError, type RetryErrorProps }
