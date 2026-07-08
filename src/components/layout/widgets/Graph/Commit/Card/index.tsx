import * as Ariakit from '@ariakit/react'
import { IconGitCommit } from '@tabler/icons-react'

import type { CommitInfo } from '@/api/models'
import { showCommitSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Commit'
import {
  useAmendInteraction,
  useSingleCommitInteractions,
} from '@/interactions/commit'
import { group } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import type { InteractionEntry } from '@/lib/Interactive/types'
import { ShortcutIndicator } from '@/lib/Shortcuts/Indicator'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
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

  const interactions = useSingleCommitInteractions(commitInfo)

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
  interactions: InteractionEntry[][]
}

const CurrentGraphCommitCardInner = (props: GraphCommitCardInnerProps) => {
  const { commitInfo, interactions, ...buttonProps } = props

  const amend = useAmendInteraction(commitInfo)
  const settings = useSettings()

  useShortcutBinding(settings.amendShortcut, () => {
    triggerInteraction(amend)
  })

  return (
    <ShortcutIndicator hotkey={settings.amendShortcut}>
      <GraphCommitCardInner
        commitInfo={commitInfo}
        interactions={[group(amend), ...interactions]}
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
          'transition-colors duration-150',
          'hover:dithered-bg-dark-400 data-active-item:dithered-bg-dark-400',
          'hover:data-active-item:dithered-bg-dark-300',
          'size-full',
        )}
        render={
          <InteractiveItem
            interactions={interactions}
            onActivate={() => {
              showCommitSnapshotDetailsDialog(commitInfo)
            }}
          />
        }
      >
        <div
          className={cn(
            'size-full overflow-hidden',
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

export { GraphCommitCard, type GraphCommitCardProps }
