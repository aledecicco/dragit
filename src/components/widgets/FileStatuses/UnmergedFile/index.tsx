import {
  IconCheck,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFolderCode,
  IconFolderMinus,
  IconFolderPlus,
  IconTrash,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { P, match } from 'ts-pattern'

import { useAddToIndex, useRemoveFromTree } from '@api/commands'
import type { UnmergedFile } from '@api/models'
import { FileStatusItem } from '../File'

interface UnmergedFileStatusItemProps {
  file: UnmergedFile
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-warning-300')}
      Glyph={match(file.unstaged)
        .with(P.union('addedByThem', 'addedByUs', 'bothAdded'), () =>
          file.isDir ? IconFolderPlus : IconFilePlus,
        )
        .with(P.union('deletedByThem', 'deletedByUs', 'bothDeleted'), () =>
          file.isDir ? IconFolderMinus : IconFileMinus,
        )
        .with('bothModified', () =>
          file.isDir ? IconFolderCode : IconFilePencil,
        )
        .exhaustive()}
      actions={[
        {
          Glyph: IconCheck,
          label: 'Mark as resolved',
          action: () => stage.mutate([file.path]),
          disabled: stage.isPending,
        },
        ...match(file.unstaged)
          .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
            {
              Glyph: IconTrash,
              label: 'Delete',
              action: () => remove.mutate([file.path]),
              disabled: remove.isPending,
            },
          ])
          .otherwise(() => []),
      ]}
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
