import * as Ariakit from '@ariakit/react'

import type { RefName, VersionedFileInfo } from '@/api/models'
import { FileItem } from '@/common/File/Item'
import { useSingleVersionedFileInteractions } from '@/interactions/file'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'

interface SnapshotDetailsDialogFileItemProps extends MultiSelectItemProps {
  /**
   * The file that this list item should display.
   */
  file: VersionedFileInfo

  /**
   * The snapshot this file belongs to.
   */
  snapshot: RefName

  /**
   * The snapshot this file is being compared against.
   */
  against?: RefName
}

/**
 * The list item for files in the snapshot details dialog.
 *
 * Displays as a radio item to allow selecting files.
 */
const SnapshotDetailsDialogFileItem = (
  props: SnapshotDetailsDialogFileItemProps,
) => {
  const { file, snapshot, against, ...itemProps } = props

  const interactions = useSingleVersionedFileInteractions(file, snapshot)

  const radio = Ariakit.useRadioContext()

  return (
    <Ariakit.Radio
      onClick={(e) => {
        e.preventDefault()
      }}
      value={file.path}
      render={
        <InteractiveItem
          interactions={against ? [] : interactions}
          onActivate={() => {
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

export {
  SnapshotDetailsDialogFileItem,
  type SnapshotDetailsDialogFileItemProps,
}
