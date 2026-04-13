import type { BranchInfo } from '@/api/models'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { usePullBranch, useRebaseBranch } from '@/api/mutations/pullBranch'
import { useForcePushBranch, usePushBranch } from '@/api/mutations/pushBranch'
import { interaction } from '@/lib/ActionButton/utils'
import { useSelectedUpstream } from '@/state/upstream'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { getUpstreamReference } from '@/utils/repository'

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
  const rebase = useRebaseBranch(branch)
  const fastForward = useFastForwardBranch(branch)

  const upstream = useSelectedUpstream(branch)

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        compact
        fixed
        action={isBase ? fastForward : pull}
        alternatives={
          isBase
            ? undefined
            : [
                interaction({
                  action: rebase,
                }),
              ]
        }
        disabled={
          toolbarProps.disabled ||
          !branch ||
          branch.type !== 'local' ||
          !upstream
        }
      />
      <ToolbarItem
        compact
        fixed
        action={push}
        alternatives={[
          interaction({
            action: forcePush,
            isDangerous: true,
            details:
              upstream &&
              `force push "${branch.name}" to "${getUpstreamReference(upstream).refName}"`,
          }),
        ]}
        disabled={
          toolbarProps.disabled ||
          !branch ||
          branch.type !== 'local' ||
          !upstream
        }
      />
    </Toolbar>
  )
}

export { BranchToolbar, type BranchToolbarProps }
