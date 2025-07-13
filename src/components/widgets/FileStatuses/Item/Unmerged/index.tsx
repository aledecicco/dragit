import { IconCheck, IconFileAlert, IconTrash } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import type { UnmergedFileInfo } from '@/api/models'
import { withContextMenu } from '@/lib/ContextMenu'
import type { ListItemProps } from '@/ui/ListItem'
import { cn, propsWithCn } from '@/utils/styles'

import { FileStatusItem } from '..'

interface UnmergedFileStatusItemProps extends ListItemProps {
  /**
   * Information about the unmerged file to display.
   */
  file: UnmergedFileInfo
}

/**
 * The list item for files in the 'unmerged' file statuses widget section.
 */
const UnmergedFileStatusItem = withContextMenu<UnmergedFileStatusItemProps>(
  (props) => {
    const { file, ...itemProps } = props

    return (
      <FileStatusItem
        {...propsWithCn(itemProps, 'text-light-600')}
        file={file}
        Glyph={IconFileAlert}
        statusMessage={
          <p
            className={cn(
              'text-xs text-warning-400/50',
              'text-nowrap overflow-hidden text-ellipsis',
            )}
          >
            {match(file.changes)
              .with('addedByThem', () => 'Added by incoming changes')
              .with('addedByUs', () => 'Added by local changes')
              .with('bothAdded', () => 'Added by local and incoming changes')
              .with('deletedByThem', () => 'Deleted by incoming changes')
              .with('deletedByUs', () => 'Deleted by local changes')
              .with(
                'bothDeleted',
                () => 'Deleted by local and incoming changes',
              )
              .with(
                'bothModified',
                () => 'Modified by local and incoming changes',
              )
              .exhaustive()}
          </p>
        }
      />
    )
  },
  ({ file }) => {
    return [
      {
        label: 'Mark as resolved',
        Glyph: IconCheck,
        onClick: () => {}, // TODO: resolve,
      },
      ...match(file.changes)
        .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
          {
            onClick: () => {}, // TODO: delete
            label: 'Delete',
            Glyph: IconTrash,
          },
        ])
        .otherwise(() => []),
    ]
  },
)

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
