import { IconEye } from '@tabler/icons-react'

import type { FileOfType } from '@/api/models'
import { useUnstageFile } from '@/api/mutations/removeFromIndex'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { MenuItem } from '@/ui/Menu/Item'

import type { STAGED_FILE_TYPES } from '../..'

interface StagedFileContextMenuProps {
  file: FileOfType<(typeof STAGED_FILE_TYPES)[number]>
}

const StagedFileContextMenu = (props: StagedFileContextMenuProps) => {
  const { file } = props

  const unstage = useUnstageFile(file)

  return (
    <>
      <MenuItem mainAction={unstage} />
      <MenuItem
        label="View changes"
        Glyph={IconEye}
        onClick={() => {
          showWorktreeFileDiffDialog(file)
        }}
      />
    </>
  )
}

export { StagedFileContextMenu, type StagedFileContextMenuProps }
