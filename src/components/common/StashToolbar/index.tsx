import type { StashInfo } from '@/api/models'
import { useApplyStash, useDiscardStash } from '@/api/mutations'
import {
  ActionToolbar,
  type ActionToolbarProps,
  type ToolbarTool,
} from '@/lib/ActionToolbar'
import { viewStash } from '@/utils/actions'

interface StashToolbarProps extends Partial<ActionToolbarProps> {
  /**
   * The stash to operate on.
   */
  stash: StashInfo
}

/**
 * The common set of tools for stashes.
 */
const StashToolbar = (props: StashToolbarProps) => {
  const { stash, ...toolbarProps } = props

  const applyStash = useApplyStash(stash)
  const discardStash = useDiscardStash(stash)

  const tools: ToolbarTool[] = [
    {
      mainAction: viewStash(stash),
    },
    {
      mainAction: applyStash,
    },
    {
      mainAction: discardStash,
    },
  ]

  return <ActionToolbar tools={tools} size="sm" compact {...toolbarProps} />
}

export { StashToolbar, type StashToolbarProps }
