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
import { IconButton } from '@lib/IconButton'
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
      actions={
        <>
          <IconButton
            Glyph={IconCheck}
            variant="neutral"
            size="sm"
            aria-label="Mark conflict as resolved"
            onClick={() => stage.mutate([file.path])}
          />

          {match(file.unstaged)
            .with(
              P.union('bothDeleted', 'deletedByThem', 'deletedByUs'),
              () => (
                <IconButton
                  Glyph={IconTrash}
                  variant="neutral"
                  size="sm"
                  aria-label="Delete file"
                  onClick={() => remove.mutate([file.path])}
                />
              ),
            )
            .otherwise(() => undefined)}
        </>
      }
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
