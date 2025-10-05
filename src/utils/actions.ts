import { IconEye } from '@tabler/icons-react'

import type { FileInfo, StashInfo } from '@/api/models'
import { showSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
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

export const viewWorktreeFileDiff = (file: FileInfo): InstantAction => ({
  id: `view_worktree_file_diff:${file.status}:${file.path}`,
  type: 'instant',
  label: 'View changes',
  Glyph: IconEye,
  run: () => {
    showWorktreeFileDiffDialog(file)
  },
})
