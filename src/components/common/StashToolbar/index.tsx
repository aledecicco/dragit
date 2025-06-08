import { IconPackageExport, IconTrash } from '@tabler/icons-react'

import type { StashInfo } from '@api/models'
import { useApplyStash, useDiscardStash } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

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

  const apply = useApplyStash()
  const discard = useDiscardStash()

  const tools = [
    {
      action: {
        run: () => apply.mutateAsync({ stashId: stash.id }),
        label: {
          idle: 'Apply',
          running: 'Applying',
          success: 'Applied',
          error: 'Failed',
        },
        Glyph: IconPackageExport,
      },
    },
    {
      action: {
        run: () => discard.mutateAsync({ stashId: stash.id }),
        label: {
          idle: 'Discard',
          running: 'Discarding',
          success: 'Discarded',
          error: 'Failed',
        },
        Glyph: IconTrash,
      },
    },
  ]

  return <Toolbar tools={tools} size="sm" compact {...toolbarProps} />
}

export { StashToolbar, type StashToolbarProps }
