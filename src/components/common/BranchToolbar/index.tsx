import type { BranchInfo } from '@/api/models'
import {
  useFastForwardBranchInteraction,
  useForcePushBranchInteraction,
  usePullBranchInteraction,
  usePushBranchInteraction,
  useRebaseBranchInteraction,
} from '@/interactions/branch'
import { useSettings } from '@/state/storage'
import { useSelectedUpstream } from '@/state/upstream'
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

  const push = usePushBranchInteraction(branch)
  const forcePush = useForcePushBranchInteraction(branch)
  const pull = usePullBranchInteraction(branch)
  const rebase = useRebaseBranchInteraction(branch)
  const fastForward = useFastForwardBranchInteraction(branch)

  const upstream = useSelectedUpstream(branch)

  const settings = useSettings()

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        {...(isBase ? fastForward : pull)}
        alternatives={isBase ? undefined : [rebase]}
        disabled={
          toolbarProps.disabled ||
          !branch ||
          branch.type !== 'local' ||
          !upstream
        }
        shortcut={isBase ? undefined : settings.pullShortcut}
        compact
        fixed
      />
      <ToolbarItem
        {...push}
        alternatives={[forcePush]}
        disabled={
          toolbarProps.disabled ||
          !branch ||
          branch.type !== 'local' ||
          !upstream
        }
        shortcut={isBase ? undefined : settings.pushShortcut}
        compact
        fixed
      />
    </Toolbar>
  )
}

export { BranchToolbar, type BranchToolbarProps }
