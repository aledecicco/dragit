import type { ComponentProps } from 'react'
import { IconExclamationCircle } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useQueryHeadInfo } from '@/api/queries/headInfo'
import { Icon } from '@/ui/Icon'
import { Toolbar } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { cn, propsWithCn } from '@/utils/styles'

interface PendingActionsProps extends ComponentProps<'div'> {}

const PendingActions = (props: PendingActionsProps) => {
  const { ...divProps } = props

  const worktreeStatus = useQueryHeadInfo().data?.worktreeStatus

  const abortMerge = useAbortMerge()
  const continueMerge = useContinueMerge()
  const abortRebase = useAbortRebase()
  const continueRebase = useContinueRebase()

  return (
    worktreeStatus &&
    worktreeStatus !== 'clean' && (
      <div
        {...propsWithCn(
          divProps,
          'bg-dark-600 rounded-sm border border-dark-200 shadow-lg',
          'flex flex-row justify-between items-center gap-12 p-3',
        )}
      >
        <p
          className={cn(
            'text-xs text-warning-400',
            'flex flex-row items-center gap-1',
          )}
        >
          <Icon Glyph={IconExclamationCircle} size="sm" />
          {match(worktreeStatus)
            .with('merging', () => 'Merge in progress')
            .with('rebasing', () => 'Rebase in progress')
            .exhaustive()}
        </p>

        <Toolbar>
          {match(worktreeStatus)
            .with('merging', () => (
              <>
                <ToolbarItem
                  size="sm"
                  status="neutral"
                  compact
                  tool={{ mainAction: abortMerge }}
                />
                <ToolbarItem
                  size="sm"
                  status="neutral"
                  tool={{ mainAction: continueMerge }}
                />
              </>
            ))
            .with('rebasing', () => (
              <>
                <ToolbarItem
                  size="sm"
                  status="neutral"
                  compact
                  tool={{ mainAction: abortRebase }}
                />
                <ToolbarItem
                  size="sm"
                  status="neutral"
                  tool={{ mainAction: continueRebase }}
                />
              </>
            ))
            .exhaustive()}
        </Toolbar>
      </div>
    )
  )
}

export { PendingActions, type PendingActionsProps }
