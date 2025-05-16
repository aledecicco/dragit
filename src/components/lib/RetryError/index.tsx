import type { ComponentProps } from 'react'

import { IconReload } from '@tabler/icons-react'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface RetryErrorProps extends ComponentProps<'div'> {
  message: string
  retry: () => void
}

const RetryError = (props: RetryErrorProps) => {
  const { message, retry } = props

  return (
    <div
      {...propsWithCn(
        props,
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
