import * as Ariakit from '@ariakit/react'

import type { CommitInfo } from '@/api/models'
import { useAmend } from '@/api/mutations/commitIndex'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useTagCommit } from '@/api/mutations/createTag'
import { useMergeCommit } from '@/api/mutations/merge'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { interaction } from '@/lib/ActionButton/utils'
import { InteractionHandler } from '@/lib/InteractionHandler'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface GraphCommitCardProps extends Ariakit.ButtonProps {
  /**
   * Information about the commit to display.
   */
  commitInfo: CommitInfo

  /**
   * Whether this commit is the current one.
   */
  isCurrent?: boolean
}

/**
 * A summary card for a commit in the commit graph.
 */
const GraphCommitCard = (props: GraphCommitCardProps) => {
  const { commitInfo, isCurrent, ...buttonProps } = props

  const timeAgo = useDateDifference(commitInfo.timestamp)
  const interactions = useInteractions(commitInfo, !!isCurrent)

  return (
    <InteractionHandler
      interactions={interactions}
      render={
        <Ariakit.Button
          {...propsWithCn(
            buttonProps,
            'p-2 border border-dark-100 rounded-sm',
            'cursor-pointer',
            'bg-dark-800/75 dithered-bg-dark-600 dithering-size-[0.3]',
            'hover:dithered-bg-dark-500 data-active-item:dithered-bg-dark-500',
            'w-full h-full overflow-hidden',
            'flex flex-col gap-y-1 items-stretch',
          )}
          onClick={(e) => {
            buttonProps.onClick?.(e)
            showSnapshotDetailsDialog(commitInfo)
          }}
        />
      }
    >
      <p
        className={cn(
          'text-start text-sm text-ellipsis text-nowrap overflow-hidden',
          !commitInfo.message && 'italic text-light-800',
        )}
      >
        {commitInfo.message ?? 'No message.'}
      </p>
      <div className={cn('flex flex-row items-center justify-between gap-x-2')}>
        <Marquee className={cn('text-xs text-light-950')} reverse={false}>
          {commitInfo.authorName}, {timeAgo}
        </Marquee>

        <p className={cn('text-xs text-light-600 min-w-max')}>
          #{commitInfo.shortHash}
        </p>
      </div>
    </InteractionHandler>
  )
}

const useInteractions = (commit: CommitInfo, isCurrent: boolean) => {
  const createBranch = useCreateBranchAt(commit.id)
  const branchOff = useBranchOff(commit.id)
  const merge = useMergeCommit(commit.id)
  const amend = useAmend()
  const tag = useTagCommit(commit)

  return [
    ...(isCurrent
      ? [
          [
            interaction({
              action: amend,
              argsRequester: () =>
                requestCommitParams(commit.message ?? '', true),
            }),
          ],
        ]
      : []),
    [
      interaction({
        action: createBranch,
        argsRequester: () => requestBranchName(commit.id),
      }),
      interaction({
        action: branchOff,
        argsRequester: () => requestBranchName(commit.id),
      }),
      interaction({
        action: merge,
      }),
    ],
    [
      interaction({
        action: tag,
        argsRequester: () =>
          requestTagParams(commit.shortHash).then(({ name, message }) => ({
            tagName: name,
            message,
          })),
      }),
    ],
  ]
}

export { GraphCommitCard, type GraphCommitCardProps }
