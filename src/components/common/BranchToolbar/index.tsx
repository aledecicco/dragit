import type { BranchInfo } from '@/api/models'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { usePullBranch } from '@/api/mutations/pullBranch'
import { useForcePushBranch, usePushBranch } from '@/api/mutations/pushBranch'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

interface BranchToolbarProps extends Partial<ToolbarProps> {
  /**
   * The branch to operate on.
   */
  branch: BranchInfo

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
        action={isBase ? fastForward : pull}
        disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
      />
      <ToolbarItem
        compact
        fixed
        action={push}
        alternatives={[{ action: forcePush }]}
        disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
      />
    </Toolbar>
  )
}

export { BranchToolbar, type BranchToolbarProps }
