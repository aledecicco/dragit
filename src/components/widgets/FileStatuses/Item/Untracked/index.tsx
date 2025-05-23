import { IconFileUnknown } from '@tabler/icons-react'

import type { UntrackedFileInfo } from '@api/models'
import type { ListItemProps } from '@ui/ListItem'
import { propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface UntrackedFileStatusItemProps extends ListItemProps {
  item: UntrackedFileInfo
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { item, ...itemProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(itemProps, 'text-light-950/90')}
      item={item}
      fileType="untracked"
      Glyph={IconFileUnknown}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
