import type { ComponentProps } from 'react'

import type { DiffSummary } from '@api/models'
import { pluralize } from '@utils/string'
import { cn, propsWithCn } from '@utils/styles'

interface ChangesSumaryProps extends ComponentProps<'span'> {
  diff: DiffSummary
}

const ChangesSumary = (props: ChangesSumaryProps) => {
  const { diff, ...spanProps } = props

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
          <span className={cn('text-success-300/80')}>+{diff.insertions}</span>
        </>
      )}
      {diff.deletions > 0 && (
        <>
          {' '}
          • <span className={cn('text-danger-300/80')}>-{diff.deletions}</span>
        </>
      )}
    </span>
  )
}

export { ChangesSumary, type ChangesSumaryProps }
