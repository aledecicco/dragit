import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { cn, propsWithCn } from '@/utils/styles'
import type { Status } from '@/utils/types'

interface ProgressBarProps extends ComponentProps<'div'> {
  /**
   * Completion percentage.
   */
  progress: number

  /**
   * Status of the progress bar to control its styles.
   */
  status?: Status
}

/**
 * Controlled progress bar component.
 */
const ProgressBar = (props: ProgressBarProps) => {
  const { progress, status = 'primary', ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'h-1 w-full rounded-full bg-dark-100')}>
      <div
        className={cn(
          'h-full rounded-full',
          match(status)
            .with('primary', () => 'bg-primary-500')
            .with('neutral', () => 'bg-light-950')
            .with('success', () => 'bg-success-600')
            .with('warning', () => 'bg-warning-600')
            .with('danger', () => 'bg-danger-700')
            .exhaustive(),
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export { ProgressBar }
