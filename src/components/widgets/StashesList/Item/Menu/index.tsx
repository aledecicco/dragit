import { IconEye } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useApplyStash } from '@/api/mutations/applyStash'
import { useDiscardStash } from '@/api/mutations/discardStash'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'

interface StashContextMenuProps {
  /**
   * The stash to use for context menu actions.
   */
  stash: StashInfo
}

/**
 * The context menu for stashes.
 */
const StashContextMenu = (props: StashContextMenuProps) => {
  const { stash } = props

  const apply = useApplyStash(stash)
  const discard = useDiscardStash(stash)

  return (
    <>
      <MenuItem
        label="View"
        Glyph={IconEye}
        onClick={() => {
          showSnapshotDetailsDialog(stash)
        }}
      />
      <MenuItem action={apply} />

      <Separator />

      <MenuItem action={discard} status="danger" />
    </>
  )
}

export { StashContextMenu, type StashContextMenuProps }
