import { match } from 'ts-pattern'

import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

interface PendingActionsProps extends ToolbarProps {}

const PendingActions = (props: PendingActionsProps) => {
  const { ...toolbarProps } = props

  const worktreeStatus = useQueryHeadInfo().data?.worktreeStatus

  const abortMerge = useAbortMerge()
  const continueMerge = useContinueMerge()
  const abortRebase = useAbortRebase()
  const continueRebase = useContinueRebase()

  return (
    worktreeStatus &&
    worktreeStatus !== 'clean' && (
      <Toolbar fixed {...toolbarProps}>
        {match(worktreeStatus)
          .with('merging', () => (
            <>
              <ToolbarItem fixed tool={{ mainAction: abortMerge }} />
              <ToolbarItem fixed tool={{ mainAction: continueMerge }} />
            </>
          ))
          .with('rebasing', () => (
            <>
              <ToolbarItem fixed tool={{ mainAction: abortRebase }} />
              <ToolbarItem fixed tool={{ mainAction: continueRebase }} />
            </>
          ))
          .exhaustive()}
      </Toolbar>
    )
  )
}

export { PendingActions, type PendingActionsProps }
