import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
  IconFolderCode,
  IconFolderCog,
  IconFolderMinus,
  IconFolderPlus,
  IconFolderShare,
  IconFolders,
  IconMinus,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../File'

interface StagedFileStatusItemProps extends ComponentProps<'div'> {
  item: StagedFile
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
          {match(item.staged)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('copied', () => 'Copied')
            .with('renamed', () => 'Renamed')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.staged)
        .with('added', () => (item.isDir ? IconFolderPlus : IconFilePlus))
        .with('deleted', () => (item.isDir ? IconFolderMinus : IconFileMinus))
        .with('modified', () => (item.isDir ? IconFolderCode : IconFilePencil))
        .with('copied', () => (item.isDir ? IconFolders : IconFiles))
        .with('renamed', () =>
          item.isDir ? IconFolderShare : IconFileArrowRight,
        )
        .with('typeChanged', () => (item.isDir ? IconFolderCog : IconFileCode2))
        .exhaustive()}
      actions={[
        {
          Glyph: IconMinus,
          label: 'Unstage',
          action: () => unstage.mutate([item.path]),
          disabled: unstage.isPending,
        },
      ]}
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
