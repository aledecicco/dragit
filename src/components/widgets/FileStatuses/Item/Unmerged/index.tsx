import { IconFileAlert } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { UnmergedFileInfo } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface UnmergedFileStatusItemProps extends ComponentProps<'div'> {
  item: UnmergedFileInfo
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { item, ...divProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={item}
      type="unmerged"
      Glyph={IconFileAlert}
      statusMessage={
        <p className={cn('text-xs text-warning-400/50')}>
          {match(item.changes)
            .with('addedByThem', () => 'Added by incoming changes')
            .with('addedByUs', () => 'Added by local changes')
            .with('bothAdded', () => 'Added by local and incoming changes')
            .with('deletedByThem', () => 'Deleted by incoming changes')
            .with('deletedByUs', () => 'Deleted by local changes')
            .with('bothDeleted', () => 'Deleted by local and incoming changes')
            .with(
              'bothModified',
              () => 'Modified by local and incoming changes',
            )
            .exhaustive()}
        </p>
      }
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
