import {
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { UnstagedFileInfo } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface UnstagedFileStatusItemProps extends ComponentProps<'div'> {
  item: UnstagedFileInfo
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { item, ...divProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      item={item}
      type="unstaged"
      statusMessage={
        <p className={cn('text-xs text-light-950')}>
          {match(item.changes)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
    />
  )
}

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
