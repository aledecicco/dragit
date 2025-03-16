import {
  IconFileUnknown,
  IconFolderQuestion,
  IconPlus,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'

import { useAddToIndex } from '@api/commands'
import type { UntrackedFile } from '@api/models'
import { propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../File'

interface UntrackedFileStatusItemProps extends ComponentProps<'div'> {
  item: UntrackedFile
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { item, ...divProps } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-950/90')}
      file={item}
      Glyph={item.isDir ? IconFolderQuestion : IconFileUnknown}
      actions={[
        {
          Glyph: IconPlus,
          label: 'Start tracking',
          action: () => stage.mutate([item.path]),
          disabled: stage.isPending,
        },
      ]}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
