import { IconFileUnknown, IconPlus } from '@tabler/icons-react'
import type { ComponentProps } from 'react'

import type { UntrackedFileInfo } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../../List/Item'

interface UntrackedFileStatusItemProps extends ComponentProps<'div'> {
  item: UntrackedFileInfo
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { item, ...divProps } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-950/90')}
      file={item}
      Glyph={IconFileUnknown}
      actions={[
        {
          Glyph: IconPlus,
          label: 'Start tracking',
          action: () => stage.mutate({ files: [item.path] }),
          disabled: stage.isPending,
        },
      ]}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
