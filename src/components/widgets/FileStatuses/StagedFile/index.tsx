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
import clsx from 'clsx'
import { match } from 'ts-pattern'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'
import { FileStatusItem } from '../File'

interface StagedFileStatusItemProps {
  file: StagedFile
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { file } = props
  const unstage = useRemoveFromIndex()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-light-600')}
      statusMessage={
        <p className={clsx('text-xs text-success-300/80')}>
          {match(file.staged)
            .with('added', () => (file.isDir ? 'Folder added' : 'File added'))
            .with('deleted', () =>
              file.isDir ? 'Folder deleted' : 'File deleted',
            )
            .with('modified', () =>
              file.isDir ? 'Folder modified' : 'File modified',
            )
            .with('copied', () =>
              file.isDir ? 'Folder copied from' : 'File copied from',
            )
            .with('renamed', () =>
              file.isDir ? 'Folder renamed from' : 'File renamed from',
            )
            .with('typeChanged', () =>
              file.isDir ? 'Folder type changed' : 'File type changed',
            )
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
