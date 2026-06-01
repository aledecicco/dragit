import { IconFile } from '@tabler/icons-react'

import type { StagedFile } from '@/api/models'
import { useUnstageFile } from '@/api/mutations/removeFromIndex'
import { useDiscardFileChanges } from '@/api/mutations/restore'
import { FileItem } from '@/common/File/Item'
import { group, interaction } from '@/lib/ActionButton/utils'
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

  const interactions = useInteractions(file)
  const unstage = useUnstageFile(file)

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
          triggerInteraction({
            action: unstage,
          })
        }}
        render={<MultiSelectItem {...itemProps} />}
      >
        <FileItem file={file} />
      </InteractiveItem>
    </Draggable>
  )
}

const useInteractions = (file: StagedFile) => {
  const unstage = useUnstageFile(file)
  const discard = useDiscardFileChanges(file)

  return [
    group(interaction({ action: unstage })),
    group(
      interaction({
        action: discard,
        isDangerous: true,
        details: `discard changes in ${file.path}`,
      }),
    ),
  ]
}

export { StagedChangesItem, type StagedChangesItemProps }
