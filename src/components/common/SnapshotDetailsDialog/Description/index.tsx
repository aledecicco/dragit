import type { ComponentProps } from 'react'

import type { SnapshotInfo } from '@/api/models'
import { ProfilePicture } from '@/common/ProfilePicture'
import { cn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface SnapshotDialogDescriptionProps extends ComponentProps<'div'> {
  /**
   * The snapshot being displayed.
   */
  snapshotInfo: SnapshotInfo
}

/**
 * Displays extra information about a snapshot.
 */
const SnapshotDialogDescription = (props: SnapshotDialogDescriptionProps) => {
  const { snapshotInfo, ...divProps } = props
  const timeAgo = useDateDifference(snapshotInfo.timestamp)

  return (
    <div {...divProps}>
      <div
        className={cn(
          'border-1 border-dark-50 rounded-sm',
          'bg-dark-500 text-light-400 text-sm whitespace-pre-wrap',
          'p-3 max-h-40 overflow-y-auto',
          'mb-2',
          !snapshotInfo.message && 'italic text-light-950',
        )}
      >
        {snapshotInfo.message ?? 'No message.'}
      </div>

      {'authorName' in snapshotInfo ? (
        <div className={cn('flex flex-row items-center gap-x-1')}>
          <ProfilePicture username={snapshotInfo.authorName} size="md" />
          <p className={cn('text-xs text-light-950')}>
            {snapshotInfo.authorName}, {timeAgo}
          </p>
        </div>
      ) : (
        <p className={cn('text-xs text-light-950 first-letter:capitalize')}>
          {timeAgo}
        </p>
      )}
    </div>
  )
}

export { SnapshotDialogDescription, type SnapshotDialogDescriptionProps }
