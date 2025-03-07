import {
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFolderCode,
  IconFolderCog,
  IconFolderMinus,
  IconFolderPlus,
  IconPlus,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { match } from 'ts-pattern'

import { useAddToIndex } from '@api/commands'
import type { UnstagedFile } from '@api/models'
import { FileStatusItem } from '../File'

interface UnstagedFileStatusItemProps {
  file: UnstagedFile
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-light-600')}
      statusMessage={
        <p className={clsx('text-xs text-light-950')}>
          {match(file.unstaged)
            .with('added', () =>
              file.isDir ? 'Directory created' : 'File created',
            )
            .with('deleted', () =>
              file.isDir ? 'Directory deleted' : 'File deleted',
            )
            .with('modified', () =>
              file.isDir ? 'Directory modified' : 'File modified',
            )
            .with('typeChanged', () =>
              file.isDir ? 'Directory type changed' : 'File type changed',
            )
            .exhaustive()}
        </p>
      }
      Glyph={match(file.unstaged)
        .with('added', () => (file.isDir ? IconFolderPlus : IconFilePlus))
        .with('deleted', () => (file.isDir ? IconFolderMinus : IconFileMinus))
        .with('modified', () => (file.isDir ? IconFolderCode : IconFilePencil))
        .with('typeChanged', () => (file.isDir ? IconFolderCog : IconFileCode2))
        .exhaustive()}
      actions={[
        {
          Glyph: IconPlus,
          label: 'Stage',
          action: () => stage.mutate([file.path]),
          disabled: stage.isPending,
        },
      ]}
    />
  )
}

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
