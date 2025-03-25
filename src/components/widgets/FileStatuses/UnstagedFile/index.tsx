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
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { UnstagedFile } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../File'

interface UnstagedFileStatusItemProps extends ComponentProps<'div'> {
  item: UnstagedFile
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { item, ...divProps } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={item}
      statusMessage={
        <p className={cn('text-xs text-light-950')}>
          {match(item.unstaged)
            .with('added', () => 'New')
            .with('deleted', () => 'Deleted')
            .with('modified', () => 'Edited')
            .with('typeChanged', () => 'Converted')
            .exhaustive()}
        </p>
      }
      Glyph={match(item.unstaged)
        .with('added', () => (item.isDir ? IconFolderPlus : IconFilePlus))
        .with('deleted', () => (item.isDir ? IconFolderMinus : IconFileMinus))
        .with('modified', () => (item.isDir ? IconFolderCode : IconFilePencil))
        .with('typeChanged', () => (item.isDir ? IconFolderCog : IconFileCode2))
        .exhaustive()}
      actions={[
        {
          Glyph: IconPlus,
          label: 'Stage',
          action: () => stage.mutate({ files: [item.path] }),
          disabled: stage.isPending,
        },
      ]}
    />
  )
}

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
