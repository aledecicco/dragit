import { IconFileUnknown } from '@tabler/icons-react'
import type { ComponentProps } from 'react'

import type { UntrackedFileInfo } from '@api/models'
import { propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface UntrackedFileStatusItemProps extends ComponentProps<'div'> {
  item: UntrackedFileInfo
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { item, ...divProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-950/90')}
      file={item}
      type="untracked"
      Glyph={IconFileUnknown}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
