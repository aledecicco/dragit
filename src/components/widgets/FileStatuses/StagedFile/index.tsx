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
  file: StagedFile
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { file, ...divProps } = props
  const unstage = useRemoveFromIndex()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={file}
      statusMessage={
        <p className={cn('text-xs text-success-300/50')}>
          {match(file.staged)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('copied', () => 'Copied')
            .with('renamed', () => 'Renamed')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(file.staged)
        .with('added', () => (file.isDir ? IconFolderPlus : IconFilePlus))
        .with('deleted', () => (file.isDir ? IconFolderMinus : IconFileMinus))
        .with('modified', () => (file.isDir ? IconFolderCode : IconFilePencil))
        .with('copied', () => (file.isDir ? IconFolders : IconFiles))
        .with('renamed', () =>
          file.isDir ? IconFolderShare : IconFileArrowRight,
        )
        .with('typeChanged', () => (file.isDir ? IconFolderCog : IconFileCode2))
        .exhaustive()}
      actions={[
        {
          Glyph: IconMinus,
          label: 'Unstage',
          action: () => unstage.mutate([file.path]),
          disabled: unstage.isPending,
        },
      ]}
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
