import { match, P } from 'ts-pattern'

import { useQueryHeadInfo } from '@/api/queries/headInfo'
import {
  useAbortCherryPickInteraction,
  useAbortMergeInteraction,
  useAbortRebaseInteraction,
  useAbortRevertInteraction,
  useCommitInteraction,
  useContinueCherryPickInteraction,
  useContinueMergeInteraction,
  useContinueRebaseInteraction,
  useContinueRevertInteraction,
} from '@/interactions/operations'
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

  const commit = useCommitInteraction()
  const abortMerge = useAbortMergeInteraction()
  const continueMerge = useContinueMergeInteraction()
  const abortRebase = useAbortRebaseInteraction()
  const continueRebase = useContinueRebaseInteraction()
  const abortCherryPick = useAbortCherryPickInteraction()
  const continueCherryPick = useContinueCherryPickInteraction()
  const abortRevert = useAbortRevertInteraction()
  const continueRevert = useContinueRevertInteraction()

  const settings = useSettings()

  return (
    <Toolbar {...toolbarProps} fixed>
      {match(worktreeStatus)
        .with('merging', () => (
          <>
            <ToolbarItem
              {...abortMerge}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
            <ToolbarItem
              {...continueMerge}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
          </>
        ))
        .with('rebasing', () => (
          <>
            <ToolbarItem
              {...abortRebase}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
            <ToolbarItem
              {...continueRebase}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
          </>
        ))
        .with('cherry-picking', () => (
          <>
            <ToolbarItem
              {...abortCherryPick}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
            <ToolbarItem
              {...continueCherryPick}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
          </>
        ))
        .with('reverting', () => (
          <>
            <ToolbarItem
              {...abortRevert}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
            <ToolbarItem
              {...continueRevert}
              fixed
              status="warning"
              size="md"
              compact={false}
            />
          </>
        ))
        .with(P.union('clean', undefined), () => (
          <ToolbarItem
            {...commit}
            shortcut={settings.commitShortcut}
            fixed
            status="primary"
            size="md"
            compact={false}
          />
        ))
        .exhaustive()}
    </Toolbar>
  )
}

export { SecondaryToolbar, type SecondaryToolbarProps }
