import * as Ariakit from '@ariakit/react'
import { IconGitCommit } from '@tabler/icons-react'

import type { CommitInfo } from '@/api/models'
import { useCherryPickCommit } from '@/api/mutations/cherryPick'
import { useAmend } from '@/api/mutations/commitIndex'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useTagCommit } from '@/api/mutations/createTag'
import { useMergeCommit } from '@/api/mutations/merge'
import { useRewindCommit } from '@/api/mutations/resetHead'
import { useRevertCommit } from '@/api/mutations/revertCommit'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import { ShortcutIndicator } from '@/lib/Shortcuts/Indicator'
import { type AnyInteraction, triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/storage'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

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
  const { commitInfo, isCurrent = false, ...buttonProps } = props

  const interactions = useInteractions(commitInfo)

  return isCurrent ? (
    <CurrentGraphCommitCardInner
      commitInfo={commitInfo}
      interactions={interactions}
      {...buttonProps}
    />
  ) : (
    <GraphCommitCardInner
      commitInfo={commitInfo}
      interactions={interactions}
      {...buttonProps}
    />
  )
}

interface GraphCommitCardInnerProps
  extends Omit<GraphCommitCardProps, 'isCurrent'> {
  interactions: AnyInteraction[][]
}

const CurrentGraphCommitCardInner = (props: GraphCommitCardInnerProps) => {
  const { commitInfo, interactions, ...buttonProps } = props

  const amend = useAmend()
  const settings = useSettings()

  return (
    <ShortcutIndicator
      hotkey={settings.amendShortcut}
      action={() => {
        triggerInteraction({
          action: amend,
          argsRequester: () =>
            requestCommitParams(commitInfo.message ?? '', true),
        })
      }}
    >
      <GraphCommitCardInner
        commitInfo={commitInfo}
        interactions={[
          group(
            interaction({
              action: amend,
              argsRequester: () =>
                requestCommitParams(commitInfo.message ?? '', true),
            }),
          ),
          ...interactions,
        ]}
        {...buttonProps}
      />
    </ShortcutIndicator>
  )
}

const GraphCommitCardInner = (props: GraphCommitCardInnerProps) => {
  const { commitInfo, interactions, ...buttonProps } = props

  const committedTime = useDateInfo(commitInfo.timestamp)

  return (
    <Draggable
      dragPayload={{
        type: 'commit',
        dragged: commitInfo,
        label: `#${commitInfo.shortHash}`,
        Glyph: IconGitCommit,
      }}
    >
      <Ariakit.CompositeItem
        {...propsWithCn(
          buttonProps,
          'group cursor-pointer select-none',
          'p-2 border border-dark-100 rounded-sm',
          'bg-dark-800/75 dithered-bg-dark-600 dithering-size-[0.3]',
          'hover:dithered-bg-dark-400 data-active-item:dithered-bg-dark-400',
          'hover:data-active-item:dithered-bg-dark-300',
          'w-full h-full',
        )}
        render={
          <InteractiveItem
            interactions={interactions}
            activationAction={() => {
              showSnapshotDetailsDialog(commitInfo)
            }}
          />
        }
      >
        <div
          className={cn(
            'w-full h-full overflow-hidden',
            'flex flex-col gap-y-1 items-stretch',
          )}
        >
          <Marquee
            reverse={false}
            className={cn(
              'text-sm',
              !commitInfo.message && 'italic text-light-800',
            )}
          >
            {commitInfo.message ?? 'No message.'}
          </Marquee>

          <div
            className={cn('flex flex-row items-center justify-between gap-x-2')}
          >
            <Marquee className={cn('text-xs text-light-950')} reverse={false}>
              {commitInfo.authorName}, {committedTime}
            </Marquee>

            <p className={cn('text-xs text-light-600 min-w-max')}>
              #{commitInfo.shortHash}
            </p>
          </div>
        </div>
      </Ariakit.CompositeItem>
    </Draggable>
  )
}

const useInteractions = (commit: CommitInfo) => {
  const createBranch = useCreateBranchAt(commit.id)
  const branchOff = useBranchOff(commit.id)
  const merge = useMergeCommit(commit.id)
  const rewind = useRewindCommit(commit.id)
  const revert = useRevertCommit(commit)
  const cherryPick = useCherryPickCommit(commit)
  const tag = useTagCommit(commit)

  return [
    group(
      interaction({
        action: createBranch,
        argsRequester: () => requestBranchName(`#${commit.shortHash}`),
      }),
      interaction({
        action: branchOff,
        argsRequester: () => requestBranchName(`#${commit.shortHash}`),
      }),
    ),
    group(
      interaction({
        action: tag,
        argsRequester: () => requestTagParams(`#${commit.shortHash}`),
      }),
    ),
    group(
      interaction({
        action: merge,
      }),
      interaction({
        action: cherryPick,
      }),
      interaction({
        action: revert,
      }),
      interaction({
        action: rewind,
      }),
    ),
  ]
}

export { GraphCommitCard, type GraphCommitCardProps }
