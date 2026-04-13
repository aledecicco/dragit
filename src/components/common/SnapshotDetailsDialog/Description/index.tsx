import type { ComponentProps } from 'react'

import type { SnapshotInfo } from '@/api/models'
import { ProfilePicture } from '@/common/ProfilePicture'
import { useRepositoryHost } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

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

  const authoredTime = useDateInfo(snapshotInfo.timestamp)

  const repositoryHost = useRepositoryHost()

  return (
    <div {...divProps}>
      <div
        className={cn(
          'border border-dark-50 rounded-sm',
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
          <ProfilePicture
            username={snapshotInfo.authorName}
            source={repositoryHost}
            size="md"
          />
          <p className={cn('text-xs text-light-950')}>
            {snapshotInfo.authorName}, {authoredTime}
          </p>
        </div>
      ) : (
        <p className={cn('text-xs text-light-950')}>Stashed {authoredTime}</p>
      )}
    </div>
  )
}

export { SnapshotDialogDescription, type SnapshotDialogDescriptionProps }
