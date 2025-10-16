import type { BranchInfo } from '@/api/models'
import {
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
}

/**
 * The common set of tools for branches (both local and remote).
 */
const BranchToolbar = (props: BranchToolbarProps) => {
  const { branch, ...toolbarProps } = props

  const pull = usePullBranch(branch)
  const push = usePushBranch(branch)
  const forcePush = useForcePushBranch(branch)

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        compact
        fixed
        tool={{ mainAction: pull }}
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
