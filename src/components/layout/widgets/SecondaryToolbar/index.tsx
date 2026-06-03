import { match, P } from 'ts-pattern'

import { useAbortCherryPick } from '@/api/mutations/abortCherryPick'
import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useAbortRevert } from '@/api/mutations/abortRevert'
import { useCommit } from '@/api/mutations/commitIndex'
import { useContinueCherryPick } from '@/api/mutations/continueCherryPick'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useContinueRevert } from '@/api/mutations/continueRevert'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { requestCommitParams } from '@/common/CommitDialog'
import { useSettings } from '@/state/storage'
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
  const abortCherryPick = useAbortCherryPick()
  const continueCherryPick = useContinueCherryPick()
  const abortRevert = useAbortRevert()
  const continueRevert = useContinueRevert()

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
        .with('cherry-picking', () => (
          <>
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={abortCherryPick}
            />
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={continueCherryPick}
            />
          </>
        ))
        .with('reverting', () => (
          <>
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={abortRevert}
            />
            <ToolbarItem
              fixed
              status="warning"
              size="md"
              compact={false}
              action={continueRevert}
            />
          </>
        ))
        .with(P.union('clean', undefined), () => (
          <ToolbarItem
            fixed
            status="primary"
            size="md"
            compact={false}
            action={commit}
            argsRequester={requestCommitParams}
            shortcut={settings.commitShortcut}
          />
        ))
        .exhaustive()}
    </Toolbar>
  )
}

export { SecondaryToolbar, type SecondaryToolbarProps }
