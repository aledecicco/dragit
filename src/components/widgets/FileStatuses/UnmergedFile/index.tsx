import {
  IconCheck,
  IconFileAlert,
  IconFolderExclamation,
  IconTrash,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { P, match } from 'ts-pattern'

import type { UnmergedFile } from '@api/models'
import { useAddToIndex, useRemoveFromTree } from '@api/mutations'
import { cn, propsWithCn } from '@utils/styles'
import { FileStatusItem } from '../Item'

interface UnmergedFileStatusItemProps extends ComponentProps<'div'> {
  item: UnmergedFile
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { item, ...divProps } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  return (
    <FileStatusItem
      {...propsWithCn(divProps, 'text-light-600')}
      file={item}
      Glyph={item.isDir ? IconFolderExclamation : IconFileAlert}
      statusMessage={
        <p className={cn('text-xs text-warning-400/50')}>
          {match(item.unstaged)
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
          action: () => stage.mutate({ files: [item.path] }),
          disabled: stage.isPending,
        },
        ...match(item.unstaged)
          .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
            {
              Glyph: IconTrash,
              label: 'Delete',
              action: () => remove.mutate({ files: [item.path] }),
              disabled: remove.isPending,
            },
          ])
          .otherwise(() => []),
      ]}
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
