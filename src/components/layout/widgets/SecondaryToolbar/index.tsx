import { match } from 'ts-pattern'

import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useCommit } from '@/api/mutations/commitIndex'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { requestCommitParams } from '@/common/CommitDialog'
import { useSettings } from '@/state/settings'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

interface SecondaryToolbarProps extends Partial<ToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for update handling.
 */
const SecondaryToolbar = (props: SecondaryToolbarProps) => {
  const { ...toolbarProps } = props

  const worktreeStatus = useQueryHeadInfo().data?.worktreeStatus

  const commit = useCommit()
  const abortMerge = useAbortMerge()
  const continueMerge = useContinueMerge()
  const abortRebase = useAbortRebase()
  const continueRebase = useContinueRebase()

  const settings = useSettings()

  return (
    <Toolbar {...toolbarProps} fixed>
      {match(worktreeStatus)
        .with('merging', () => (
          <>
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={abortMerge}
            />
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={continueMerge}
            />
          </>
        ))
        .with('rebasing', () => (
          <>
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={abortRebase}
            />
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={continueRebase}
            />
          </>
        ))
        .otherwise(() => (
          <ToolbarItem
            fixed
            status="primary"
            size="md"
            compact={false}
            action={commit}
            argsRequester={requestCommitParams}
            shortcut={settings.commitShortcut}
          />
        ))}
    </Toolbar>
  )
}

export { SecondaryToolbar, type SecondaryToolbarProps }
