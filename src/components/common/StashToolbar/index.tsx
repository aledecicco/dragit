import type { StashInfo } from '@/api/models'
import { useApplyStash, useDiscardStash } from '@/api/mutations'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'
import { viewStash } from '@/utils/actions'

interface StashToolbarProps extends Partial<ToolbarProps> {
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

  return <Toolbar tools={tools} size="sm" compact {...toolbarProps} />
}

export { StashToolbar, type StashToolbarProps }
