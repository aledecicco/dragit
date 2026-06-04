import type { ComponentProps } from 'react'
import { IconReload } from '@tabler/icons-react'

import { propsWithCn } from '@/utils/styles'

import { DecoratedButton } from '../DecoratedButton'

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
        'flex flex-row gap-x-1 p-2 items-center',
        'text-sm text-danger-600',
      )}
    >
      <p>{message}</p>
      <DecoratedButton
        label="Retry"
        Glyph={IconReload}
        size="md"
        variant="plain"
        status="danger"
        onClick={() => {
          retry()
        }}
        compact
        round
      />
    </div>
  )
}

export { RetryError, type RetryErrorProps }
