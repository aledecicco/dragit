import type { ComponentProps } from 'react'

import type { CommitInfo } from '@/api/models'
import { ProfilePicture } from '@/common/ProfilePicture'
import { useRepositoryHost } from '@/utils/repository'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

interface CommitSnapshotDetailsDialogDescriptionProps
  extends ComponentProps<'div'> {
  /**
   * The commit being displayed.
   */
  commit: CommitInfo
}

/**
 * Displays extra information about a commit.
 */
const CommitSnapshotDetailsDialogDescription = (
  props: CommitSnapshotDetailsDialogDescriptionProps,
) => {
  const { commit, ...divProps } = props

  const authoredTime = useDateInfo(commit.timestamp)

  const repositoryHost = useRepositoryHost()

  return (
    <div {...divProps}>
      <div
        className={cn(
          'border border-dark-50 rounded-sm',
          'bg-dark-500 text-light-400 text-sm whitespace-pre-wrap',
          'p-3 max-h-40 overflow-y-auto',
          'mb-2',
          !commit.message && 'italic text-light-950',
        )}
      >
        {commit.message ?? 'No message.'}
      </div>

      <div className={cn('flex flex-row items-center gap-x-1')}>
        <ProfilePicture
          username={commit.authorName}
          source={repositoryHost}
          size="md"
        />
        <p className={cn('text-xs text-light-950')}>
          {commit.authorName}, {authoredTime}
        </p>
      </div>
    </div>
  )
}

export {
  CommitSnapshotDetailsDialogDescription,
  type CommitSnapshotDetailsDialogDescriptionProps,
}
