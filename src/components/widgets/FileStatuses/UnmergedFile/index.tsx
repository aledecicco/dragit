import {
  IconCheck,
  IconFileAlert,
  IconFolderExclamation,
  IconTrash,
} from '@tabler/icons-react'
import { P, match } from 'ts-pattern'

import { useAddToIndex, useRemoveFromTree } from '@api/commands'
import type { UnmergedFile } from '@api/models'
import { cn } from '@utils/styles'
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
      className={cn('text-light-600')}
      Glyph={file.isDir ? IconFolderExclamation : IconFileAlert}
      statusMessage={
        <p className={cn('text-xs text-warning-400/50')}>
          {match(file.unstaged)
            .with('addedByThem', () => 'Added by incoming changes')
            .with('addedByUs', () => 'Added by local changes')
            .with('bothAdded', () => 'Added by local and incoming changes')
            .with('deletedByThem', () => 'Deleted by incoming changes')
            .with('deletedByUs', () => 'Deleted by local changes')
            .with('bothDeleted', () => 'Deleted by local and incoming changes')
            .with(
              'bothModified',
              () => 'Modified by local and incoming changes',
            )
            .exhaustive()}
        </p>
      }
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
