import { IconFile } from '@tabler/icons-react'

import type { StagedFile } from '@/api/models'
import { FileItem } from '@/common/File/Item'
import {
  useSingleStagedFileInteractions,
  useUnstageFileInteraction,
} from '@/interactions/file'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { triggerInteraction } from '@/state/actions'
import { changeSelectedFile } from '@/state/file'

interface StagedChangesItemProps extends MultiSelectItemProps {
  /**
   * Information about the staged file to display.
   */
  file: StagedFile
}

/**
 * The list item for files in the 'staged' file statuses widget section.
 */
const StagedChangesItem = (props: StagedChangesItemProps) => {
  const { file, ...itemProps } = props

  const interactions = useSingleStagedFileInteractions(file)
  const unstage = useUnstageFileInteraction(file)

  return (
    <Draggable
      dragPayload={{
        type: 'staged-files',
        dragged: [file],
        label: file.path,
        Glyph: IconFile,
      }}
    >
      <InteractiveItem
        interactions={interactions}
        activationAction={() => {
          changeSelectedFile(file)
        }}
        deleteAction={() => {
          triggerInteraction(unstage)
        }}
        render={<MultiSelectItem {...itemProps} />}
      >
        <FileItem file={file} />
      </InteractiveItem>
    </Draggable>
  )
}

export { StagedChangesItem, type StagedChangesItemProps }
