import type { BranchInfo } from '@/api/models'
import {
  useFastForwardBranch,
  useForcePushBranch,
  usePullBranch,
  usePushBranch,
} from '@/api/mutations'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

interface BranchToolbarProps extends Partial<ToolbarProps> {
  /**
   * The branch to operate on.
   */
  branch: BranchInfo | undefined

  /**
   * Whether this is the branch being used as base for comparison.
   */
  isBase?: boolean
}

/**
 * The common set of tools for branches (both local and remote).
 */
const BranchToolbar = (props: BranchToolbarProps) => {
  const { branch, isBase = false, ...toolbarProps } = props

  const push = usePushBranch(branch)
  const forcePush = useForcePushBranch(branch)
  const pull = usePullBranch(branch)
  const fastForward = useFastForwardBranch(branch)

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        compact
        fixed
        tool={{ mainAction: isBase ? fastForward : pull }}
        disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
      />
      <ToolbarItem
        compact
        fixed
        tool={{ mainAction: push, alternatives: [forcePush] }}
        disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
      />
    </Toolbar>
  )
}

export { BranchToolbar, type BranchToolbarProps }
