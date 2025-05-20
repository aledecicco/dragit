import * as Ariakit from '@ariakit/react'

import type { CommitInfo } from '@api/models'
import { showCommitDetailsDialog } from '@common/CommitDetailsDialog'
import { Marquee } from '@ui/Marquee'
import { cn, propsWithCn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

interface GraphCommitCardProps extends Ariakit.ButtonProps {
  commitInfo: CommitInfo
}

const GraphCommitCard = (props: GraphCommitCardProps) => {
  const { commitInfo, ...buttonProps } = props
  const timeAgo = useDateDifference(commitInfo.timestamp)

  return (
    <Ariakit.Button
      {...propsWithCn(
        buttonProps,
        'p-2 border-1 border-dark-100 rounded-sm',
        'cursor-pointer',
        'bg-dark-800/75 dithered-bg-dark-600 dithering-size-[0.3]',
        'hover:dithered-bg-dark-500 data-active-item:dithered-bg-dark-500',
        'w-full h-full overflow-hidden',
        'flex flex-col gap-y-1 items-stretch',
      )}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        showCommitDetailsDialog(commitInfo)
      }}
    >
      <p
        className={cn(
          'text-start text-sm text-ellipsis text-nowrap overflow-hidden',
        )}
      >
        {commitInfo.message}
      </p>
      <div className={cn('flex flex-row items-center justify-between gap-x-1')}>
        <Marquee className={cn('text-xs text-light-950')} reverse={false}>
          {commitInfo.authorName}, {timeAgo}
        </Marquee>

        <p className={cn('text-xs text-light-600 min-w-max')}>
          #{commitInfo.shortHash}
        </p>
      </div>
    </Ariakit.Button>
  )
}

export { GraphCommitCard, type GraphCommitCardProps }
