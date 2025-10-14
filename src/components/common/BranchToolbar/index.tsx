import type { BranchInfo } from '@/api/models'
import {
  useForcePushBranch,
  usePullBranch,
  usePushBranch,
} from '@/api/mutations'
import {
  ActionToolbar,
  type ActionToolbarProps,
  type ToolbarTool,
} from '@/lib/ActionToolbar'

interface BranchToolbarProps extends Partial<ActionToolbarProps> {
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

  const tools: ToolbarTool[] = [
    {
      mainAction: pull,
    },
    {
      mainAction: push,
      alternatives: [forcePush],
    },
  ]

  return (
    <ActionToolbar
      tools={tools}
      {...toolbarProps}
      disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
    />
  )
}

export { BranchToolbar, type BranchToolbarProps }
