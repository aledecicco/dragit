import type { ComponentProps } from 'react'

import type { StashInfo } from '@/api/models'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

interface StashSnapshotDetailsDialogDescriptionProps
  extends ComponentProps<'div'> {
  /**
   * The stash being displayed.
   */
  stash: StashInfo
}

/**
 * Displays extra information about a stash.
 */
const StashSnapshotDetailsDialogDescription = (
  props: StashSnapshotDetailsDialogDescriptionProps,
) => {
  const { stash, ...divProps } = props

  const authoredTime = useDateInfo(stash.timestamp)

  return (
    <div {...divProps}>
      <div
        className={cn(
          'border border-dark-50 rounded-sm',
          'bg-dark-500 text-light-400 text-sm whitespace-pre-wrap',
          'p-3 max-h-40 overflow-y-auto',
          'mb-2',
          !stash.message && 'italic text-light-950',
        )}
      >
        {stash.message ?? 'No message.'}
      </div>

      <p className={cn('text-xs text-light-950')}>Stashed {authoredTime}</p>
    </div>
  )
}

export {
  StashSnapshotDetailsDialogDescription,
  type StashSnapshotDetailsDialogDescriptionProps,
}
