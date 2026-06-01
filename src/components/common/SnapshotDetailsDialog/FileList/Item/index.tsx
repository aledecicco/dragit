import * as Ariakit from '@ariakit/react'

import type { SnapshotInfo, VersionedFileInfo } from '@/api/models'
import { useRestoreFileState } from '@/api/mutations/restore'
import { FileItem } from '@/common/File/Item'
import { group, interaction } from '@/lib/ActionButton/utils'
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

  const interactions = useInteractions(file, snapshotInfo)

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

const useInteractions = (
  file: VersionedFileInfo,
  snapshotInfo: SnapshotInfo,
) => {
  const restore = useRestoreFileState(file, snapshotInfo.id)

  return [group(interaction({ action: restore }))]
}

export { SnapshotDetailsDialogItem, type SnapshotDetailsDialogItemProps }
