import { match } from 'ts-pattern'

import type { ToastArgs } from '@/lib/Toasts/Toast'
import type { AgentError } from '@/utils/error'
import { cn } from '@/utils/styles'

const agentFailedToast = (operation: string, error: AgentError): ToastArgs => {
  return {
    status: 'danger',
    title: `Failed to ${operation}`,
    description: <AgentFailedToast error={error} />,
  }
}

const AgentFailedToast = (props: { error: AgentError }) => {
  const { error } = props

  return (
    <div className={cn('w-full overflow-hidden')}>
      Agent{' '}
      {match(error.type)
        .with('notConfigured', () => 'not configured')
        .otherwise(() => 'failed to run')}
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

export { agentFailedToast }
