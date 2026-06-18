import type { ToastArgs } from '@/lib/Toasts/Toast'
import { Chip } from '@/ui/Chip'
import { Marquee } from '@/ui/Marquee'
import type { GitError } from '@/utils/error'
import { cn } from '@/utils/styles'

const gitOperationFailedToast = (
  operation: string,
  error: GitError,
): ToastArgs => {
  return {
    status: 'danger',
    title: `Failed to ${operation}`,
    description: <GitOperationFailedToast error={error} />,
  }
}

const GitOperationFailedToast = (props: { error: GitError }) => {
  const { error } = props

  return (
    <div className={cn('w-full overflow-hidden')}>
      Failed to run command{' '}
      <Chip size="md" className={cn('max-w-full inline-block')}>
        <Marquee reverse={false}>{error.command}</Marquee>
      </Chip>
      <div
        className={cn(
          'bg-dark-700 p-2 mt-2 max-h-30 overflow-y-auto whitespace-pre',
        )}
      >
        Error log: {'reason' in error ? error.reason : '-'}
      </div>
    </div>
  )
}

export { gitOperationFailedToast }
