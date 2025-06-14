import {
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconPlus,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { UnstagedFileInfo } from '@/api/models'
import { useAddToIndex } from '@/api/mutations'
import { withContextMenu } from '@/lib/ContextMenu'
import type { ListItemProps } from '@/ui/ListItem'
import { cn, propsWithCn } from '@/utils/styles'

import { FileStatusItem } from '..'

/**
 * Information about the unstaged file to display.
 */
interface UnstagedFileStatusItemProps extends ListItemProps {
  file: UnstagedFileInfo
}

/**
 * The list item for files in the 'unstaged' file statuses widget section.
 */
const UnstagedFileStatusItem = withContextMenu<UnstagedFileStatusItemProps>(
  (props) => {
    const { file, ...itemProps } = props

    return (
      <FileStatusItem
        {...propsWithCn(itemProps, 'text-light-600')}
        file={file}
        statusMessage={
          <p className={cn('text-xs text-light-950')}>
            {match(file.changes)
              .with('added', () => 'New')
              .with('deleted', () => 'Deleted')
              .with('modified', () => 'Edited')
              .with('typeChanged', () => 'Converted')
              .exhaustive()}
          </p>
        }
        Glyph={match(file.changes)
          .with('added', () => IconFilePlus)
          .with('deleted', () => IconFileMinus)
          .with('modified', () => IconFilePencil)
          .with('typeChanged', () => IconFileCode2)
          .exhaustive()}
      />
    )
  },
  ({ file }) => {
    const stage = useAddToIndex()

    return [
      {
        label: 'Stage',
        Glyph: IconPlus,
        onClick: () => stage.mutateAsync({ files: [file.path] }),
      },
    ]
  },
)

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
