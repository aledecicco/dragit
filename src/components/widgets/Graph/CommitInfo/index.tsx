import type { CommitInfo } from '@api/models'
import { cn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

interface GraphCommitInfoProps {
  commitInfo: CommitInfo
}

const GraphCommitInfo = (props: GraphCommitInfoProps) => {
  const { commitInfo } = props
  const timeAgo = useDateDifference(commitInfo.timestamp)

  return (
    <div className={cn('flex flex-col gap-4')}>
      <div>
        <p className={cn('text-xs text-light-800')}>
          {commitInfo.authorName} - {commitInfo.authorEmail}
        </p>
        <p className={cn('text-xs text-light-800')}>{timeAgo}</p>
      </div>
      <p className={cn('text-sm', 'max-h-20 overflow-y-auto break-words')}>
        {commitInfo.message}
      </p>
      <p className={cn('text-xs text-primary-300')}>{commitInfo.hash}</p>
    </div>
  )
}

export { GraphCommitInfo, type GraphCommitInfoProps }
