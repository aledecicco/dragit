import { IconFile } from '@tabler/icons-react'

import type { NotStagedFile } from '@/api/models'
import { FileItem } from '@/common/File/Item'
import {
  useDiscardFileInteraction,
  useSingleNotStagedFileInteractions,
} from '@/interactions/file'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { changeSelectedFile } from '@/state/file'

interface NotStagedChangesItemProps extends MultiSelectItemProps {
  /**
   * Information about the not-staged file to display.
   */
  file: NotStagedFile
}

/**
 * The list item for files in the 'not staged' file statuses widget section.
 */
const NotStagedChangesItem = (props: NotStagedChangesItemProps) => {
  const { file, ...itemProps } = props

  const interactions = useSingleNotStagedFileInteractions(file)
  const discard = useDiscardFileInteraction(file)

  return (
    <Draggable
      dragPayload={{
        type: 'not-staged-files',
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
        onDelete={discard}
        render={<MultiSelectItem {...itemProps} />}
      >
        <FileItem file={file} />
      </InteractiveItem>
    </Draggable>
  )
}

export { NotStagedChangesItem, type NotStagedChangesItemProps }
