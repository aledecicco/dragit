import { IconCheck, IconTrash } from '@tabler/icons-react'
import { useMemo } from 'react'
import { P, match } from 'ts-pattern'

import type { UnmergedFileInfo } from '@api/models'
import { useAddToIndex, useRemoveFromTree } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface UnmergedFileToolbarProps extends Partial<ToolbarProps> {
  file: UnmergedFileInfo
}

const UnmergedFileToolbar = (props: UnmergedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  const tools = useMemo(() => {
    return [
      {
        action: {
          run: () => stage.mutateAsync({ files: [file.path] }),
          label: {
            idle: 'Mark as resolved',
            running: 'Staging',
            success: 'Staged',
            error: 'Failed',
          },
          Glyph: IconCheck,
        },
      },
      ...match(file.changes)
        .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
          {
            action: {
              run: () => remove.mutateAsync({ files: [file.path] }),
              label: {
                idle: 'Delete',
                running: 'Deleting',
                success: 'Deleted',
                error: 'Failed',
              },
              Glyph: IconTrash,
            },
          },
        ])
        .otherwise(() => []),
    ]
  }, [file.path, file.changes, stage.mutateAsync, remove.mutateAsync])

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UnmergedFileToolbar }
