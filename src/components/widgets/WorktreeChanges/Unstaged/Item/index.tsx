import { match, P } from 'ts-pattern'

import type { FileOfType } from '@/api/models'
import { useStageFile } from '@/api/mutations/addToIndex'
import { useStashFile } from '@/api/mutations/saveStash'
import {
  useAcceptAsIs,
  useAcceptDeletion,
  useAcceptFile,
  useAcceptOurs,
  useAcceptTheirs,
  useIgnoreDeletion,
  useIgnoreFile,
} from '@/api/mutations/solveFileConflict'
import { FileIcon } from '@/common/File/Icon'
import { FilePath } from '@/common/File/Path'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { InteractionHandler } from '@/lib/InteractionHandler'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn } from '@/utils/styles'

import type { UNSTAGED_FILE_TYPES } from '..'

interface UnstagedChangesItemProps extends ListItemProps {
  /**
   * Information about the unstaged file to display.
   */
  file: FileOfType<(typeof UNSTAGED_FILE_TYPES)[number]>
}

/**
 * The list item for files in the 'unstaged' file statuses widget section.
 */
const UnstagedChangesItem = (props: UnstagedChangesItemProps) => {
  const { file, ...itemProps } = props

  const { filedir, filename } = getPathLocation(file.path)
  const interactions = useInteractions(file)

  return (
    <InteractionHandler
      interactions={interactions}
      render={
        <ListItem
          {...itemProps}
          onClick={(e) => {
            itemProps.onClick?.(e)
            showWorktreeFileDiffDialog(file)
          }}
        />
      }
    >
      <div className={cn('w-full flex flex-col items-start')}>
        <div className={cn('flex flex-row gap-x-1 items-center min-w-0')}>
          <FileIcon file={file} />

          <Marquee className={cn('text-sm text-light-500')}>{filename}</Marquee>
        </div>

        <Marquee className={cn('text-xs text-light-900/80')}>
          <FilePath
            filepath={filedir}
            separatorProps={{ className: cn('text-light-700') }}
          />
        </Marquee>
      </div>
    </InteractionHandler>
  )
}

const useInteractions = (
  file: FileOfType<(typeof UNSTAGED_FILE_TYPES)[number]>,
) => {
  const stage = useStageFile(file)
  const stash = useStashFile(file)

  const acceptAsIs = useAcceptAsIs(file)
  const acceptOurs = useAcceptOurs(file)
  const acceptTheirs = useAcceptTheirs(file)
  const acceptDeletion = useAcceptDeletion(file)
  const ignoreDeletion = useIgnoreDeletion(file)
  const acceptNewFile = useAcceptFile(file)
  const ignoreNewFile = useIgnoreFile(file)

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
    : [group(interaction({ action: stage }), interaction({ action: stash }))]
}

export { UnstagedChangesItem, type UnstagedChangesItemProps }
