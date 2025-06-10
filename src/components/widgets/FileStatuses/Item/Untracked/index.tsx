import { IconFileUnknown } from '@tabler/icons-react'

import type { UntrackedFileInfo } from '@api/models'
import type { ListItemProps } from '@ui/ListItem'
import { propsWithCn } from '@utils/styles'
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
const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { file, ...itemProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(itemProps, 'text-light-950/90')}
      file={file}
      fileType="untracked"
      Glyph={IconFileUnknown}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
