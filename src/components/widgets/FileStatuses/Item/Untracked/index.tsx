import { IconFileUnknown, IconPlus } from '@tabler/icons-react'

import type { UntrackedFileInfo } from '@/api/models'
import { useAddToIndex } from '@/api/mutations'
import { withContextMenu } from '@/lib/ContextMenu'
import type { ListItemProps } from '@/ui/ListItem'
import { propsWithCn } from '@/utils/styles'

import { FileStatusItem } from '..'

interface UntrackedFileStatusItemProps extends ListItemProps {
  /**
   * Information about the untracked file to display.
   */
  file: UntrackedFileInfo
}

/**
 * The list item for files in the 'untracked' file statuses widget section.
 */
const UntrackedFileStatusItem = withContextMenu<UntrackedFileStatusItemProps>(
  (props) => {
    const { file, ...itemProps } = props

    return (
      <FileStatusItem
        {...propsWithCn(itemProps, 'text-light-950/90')}
        file={file}
        Glyph={IconFileUnknown}
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

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
