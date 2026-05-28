import { IconFile } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import type { NotStagedFile } from '@/api/models'
import { useStageFile } from '@/api/mutations/addToIndex'
import { useDiscardFileChanges } from '@/api/mutations/discardChanges'
import { useStashFile } from '@/api/mutations/saveStash'
import {
  useAcceptAsIs,
  useAcceptDeletion,
  useAcceptFile,
  useAcceptOurs,
  useAcceptTheirs,
  useIgnoreDeletion,
  useIgnoreFile,
} from '@/api/mutations/solveFileConflicts'
import { FileItem } from '@/common/File/Item'
import { requestStashParams } from '@/common/StashDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { triggerInteraction } from '@/state/actions'
import { changeSelectedFile } from '@/state/file'
import { getSettings } from '@/state/storage'

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

  const interactions = useInteractions(file)
  const discard = useDiscardFileChanges(file)

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
        deleteAction={() => {
          triggerInteraction({
            action: discard,
            isDangerous: true,
            details: `discard changes in ${file.path}`,
          })
        }}
        render={<MultiSelectItem {...itemProps} />}
      >
        <FileItem file={file} />
      </InteractiveItem>
    </Draggable>
  )
}

const useInteractions = (file: NotStagedFile) => {
  const stage = useStageFile(file)
  const stash = useStashFile(file)

  const acceptAsIs = useAcceptAsIs(file)
  const acceptOurs = useAcceptOurs(file)
  const acceptTheirs = useAcceptTheirs(file)
  const acceptDeletion = useAcceptDeletion(file)
  const ignoreDeletion = useIgnoreDeletion(file)
  const acceptNewFile = useAcceptFile(file)
  const ignoreNewFile = useIgnoreFile(file)

  const discard = useDiscardFileChanges(file)

  return file.status === 'unmerged'
    ? match(file.changes)
        .with(P.union('bothAdded', 'bothModified'), () => [
          group(
            interaction({ action: acceptAsIs }),
            interaction({ action: acceptOurs }),
            interaction({ action: acceptTheirs }),
          ),
        ])
        .with(P.union('addedByUs', 'addedByThem'), () => [
          group(
            interaction({ action: acceptNewFile }),
            interaction({ action: ignoreNewFile }),
          ),
        ])
        .with('bothDeleted', () => [
          group(interaction({ action: acceptDeletion })),
        ])
        .with(P.union('deletedByUs', 'deletedByThem'), () => [
          group(
            interaction({ action: acceptDeletion }),
            interaction({ action: ignoreDeletion }),
          ),
        ])
        .exhaustive()
    : [
        group(
          interaction({ action: stage }),
          interaction({
            action: stash,
            argsRequester: async () => {
              const { askForStashMessage } = getSettings()
              const message = askForStashMessage
                ? (await requestStashParams()).message
                : null

              return { message }
            },
          }),
        ),
        group(
          interaction({
            action: discard,
            isDangerous: true,
            details: `discard changes in ${file.path}`,
          }),
        ),
      ]
}

export { NotStagedChangesItem, type NotStagedChangesItemProps }
