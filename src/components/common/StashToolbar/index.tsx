import type { StashInfo } from '@/api/models'
import { useApplyStash, useDiscardStash } from '@/api/mutations'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'

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

  const applyStash = useApplyStash(stash.id)
  const discardStash = useDiscardStash(stash.id)

  const tools: ToolbarTool[] = [
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
