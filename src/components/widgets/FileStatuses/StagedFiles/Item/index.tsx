import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
  IconMinus,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { StagedFileInfo } from '@api/models'
import { useRemoveFromIndex } from '@api/mutations'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../../Item'

interface StagedFileStatusItemProps extends ComponentProps<'div'> {
  item: StagedFileInfo
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { item, ...divProps } = props
  const unstage = useRemoveFromIndex()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={item}
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
      actions={[
        {
          Glyph: IconMinus,
          label: 'Unstage',
          action: () => unstage.mutate({ files: [item.path] }),
          disabled: unstage.isPending,
        },
      ]}
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
