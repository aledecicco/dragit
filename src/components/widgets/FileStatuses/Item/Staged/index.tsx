import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { StagedFileInfo } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '..'

interface StagedFileStatusItemProps extends ComponentProps<'div'> {
  item: StagedFileInfo
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { item, ...divProps } = props

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={item}
      type="staged"
      statusMessage={
        <p className={cn('text-xs text-success-300/50')}>
          {match(item.changes)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('copied', () => 'Copied')
            .with('renamed', () => 'Renamed')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('copied', () => IconFiles)
        .with('renamed', () => IconFileArrowRight)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
