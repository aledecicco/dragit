import { IconEye } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import type { InstantAction } from '@/context/actions'

export const viewStash = (stash: StashInfo): InstantAction => ({
  id: 'view_stash',
  type: 'instant',
  label: 'View',
  Glyph: IconEye,
  run: () => {
    showSnapshotDetailsDialog(stash)
  },
})
