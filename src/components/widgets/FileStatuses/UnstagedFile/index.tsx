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
import { match } from 'ts-pattern'

import { useAddToIndex } from '@api/commands'
import type { UnstagedFile } from '@api/models'
import { cn } from '@utils/styles'
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
      className={cn('text-light-600')}
      statusMessage={
        <p className={cn('text-xs text-light-950')}>
          {match(file.unstaged)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('typeChanged', () => 'Converted')
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
