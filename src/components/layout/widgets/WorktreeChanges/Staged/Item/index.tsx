import { IconFile } from '@tabler/icons-react'

import type { StagedFile } from '@/api/models'
import { useUnstageFile } from '@/api/mutations/removeFromIndex'
import { useStashFile } from '@/api/mutations/saveStash'
import { FileIcon } from '@/common/File/Icon'
import { FilePath } from '@/common/File/Path'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn } from '@/utils/styles'

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

  const { filedir, filename } = getPathLocation(file.path)
  const interactions = useInteractions(file)

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
        render={
          <MultiSelectItem
            {...itemProps}
            onDoubleClick={(e) => {
              itemProps.onDoubleClick?.(e)
              showWorktreeFileDiffDialog(file)
            }}
          />
        }
      >
        <div className={cn('w-full flex flex-col items-start')}>
          <div
            className={cn(
              'grid grid-cols-[max-content_1fr] gap-x-1 items-center min-w-0',
            )}
          >
            <FileIcon file={file} />

            <Marquee className={cn('text-sm text-light-500')}>
              {filename}
            </Marquee>
          </div>

          <Marquee className={cn('text-xs text-light-900/80')}>
            <FilePath
              filepath={filedir}
              separatorProps={{ className: cn('text-light-700') }}
            />
          </Marquee>
        </div>
      </InteractiveItem>
    </Draggable>
  )
}

const useInteractions = (file: StagedFile) => {
  const unstage = useUnstageFile(file)
  const stash = useStashFile(file)

  return [
    group(interaction({ action: unstage }), interaction({ action: stash })),
  ]
}

export { StagedChangesItem, type StagedChangesItemProps }
