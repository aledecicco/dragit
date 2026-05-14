import * as Ariakit from '@ariakit/react'

import type { VersionedFileInfo } from '@/api/models'
import { FileItem } from '@/common/File/Item'
import { ListItem, type ListItemProps } from '@/ui/ListItem'

interface SnapshotDetailsDialogItemProps extends ListItemProps {
  /**
   * The file that this list item should display.
   */
  file: VersionedFileInfo
}

/**
 * The list item for files in the snapshot details dialog.
 *
 * Displays as a radio item to allow selecting files.
 */
const SnapshotDetailsDialogItem = (props: SnapshotDetailsDialogItemProps) => {
  const { file, ...itemProps } = props

  return (
    <Ariakit.Radio
      value={file.path}
      render={
        <ListItem {...itemProps}>
          <FileItem file={file} />
        </ListItem>
      }
    />
  )
}

export { SnapshotDetailsDialogItem, type SnapshotDetailsDialogItemProps }
