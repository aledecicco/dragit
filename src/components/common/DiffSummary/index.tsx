import type { ComponentProps } from 'react'

import type { DiffSummary } from '@/api/models'
import { pluralize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

interface ChangesSummaryProps extends ComponentProps<'span'> {
  /**
   * The diff summary to display.
   * If it's null, it's assumed there are no changes.
   */
  diff: DiffSummary | null

  /**
   * Whether to display the summary in a compact form.
   */
  compact?: boolean
}

/**
 * Displays the number of files changed, insertions, and deletions, in a diff summary.
 */
const ChangesSummary = (props: ChangesSummaryProps) => {
  const { diff, compact = true, ...spanProps } = props

  if (
    !diff ||
    (diff.insertions === 0 && diff.deletions === 0 && diff.filesCount === 0)
  ) {
    return (
      <span {...propsWithCn(spanProps, 'text-light-950/60')}>No changes</span>
    )
  }

  return (
    <span {...propsWithCn(spanProps, 'text-light-950/60')}>
      {diff.filesCount > 0 && (
        <span className={cn('text-light-950')}>
          {pluralize('file', diff.filesCount, true)}
        </span>
      )}
      {diff.insertions > 0 && (
        <>
          {' '}
          •{' '}
          <span className={cn('text-success-300/80')}>
            +{diff.insertions}{' '}
            {!compact && pluralize('insertion', diff.insertions)}
          </span>
        </>
      )}
      {diff.deletions > 0 && (
        <>
          {' '}
          •{' '}
          <span className={cn('text-danger-300/80')}>
            -{diff.deletions}{' '}
            {!compact && pluralize('deletion', diff.deletions)}
          </span>
        </>
      )}
    </span>
  )
}

export { ChangesSummary, type ChangesSummaryProps }
