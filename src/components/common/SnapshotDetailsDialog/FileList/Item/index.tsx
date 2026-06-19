import * as Ariakit from '@ariakit/react'

import type { SnapshotInfo, VersionedFileInfo } from '@/api/models'
import { FileItem } from '@/common/File/Item'
import { useSingleVersionedFileInteractions } from '@/interactions/file'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'

interface SnapshotDetailsDialogItemProps extends MultiSelectItemProps {
  /**
   * The file that this list item should display.
   */
  file: VersionedFileInfo

  snapshotInfo: SnapshotInfo
}

/**
 * The list item for files in the snapshot details dialog.
 *
 * Displays as a radio item to allow selecting files.
 */
const SnapshotDetailsDialogItem = (props: SnapshotDetailsDialogItemProps) => {
  const { file, snapshotInfo, ...itemProps } = props

  const interactions = useSingleVersionedFileInteractions(file, snapshotInfo.id)

  const radio = Ariakit.useRadioContext()

  return (
    <Ariakit.Radio
      onClick={(e) => {
        e.preventDefault()
      }}
      value={file.path}
      render={
        <InteractiveItem
          interactions={interactions}
          activationAction={() => {
            if (radio?.getState().value === file.path) {
              radio.setValue(null)
            } else {
              radio?.setValue(file.path)
            }
          }}
          render={<MultiSelectItem {...itemProps} />}
        >
          <FileItem file={file} />
        </InteractiveItem>
      }
    />
  )
}

export { SnapshotDetailsDialogItem, type SnapshotDetailsDialogItemProps }
