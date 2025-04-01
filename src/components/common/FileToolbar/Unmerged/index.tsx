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
        Glyph: IconCheck,
        label: 'Mark as resolved',
        action: () => {
          stage.mutateAsync({ files: [file.path] })
        },
        disabled: stage.isPending,
      },
      ...match(file.status)
        .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
          {
            Glyph: IconTrash,
            label: 'Delete',
            action: () => {
              remove.mutateAsync({ files: [file.path] })
            },
            disabled: remove.isPending,
          },
        ])
        .otherwise(() => []),
    ]
  }, [
    file.path,
    file.status,
    stage.mutateAsync,
    stage.isPending,
    remove.mutateAsync,
    remove.isPending,
  ])

  return <Toolbar size="sm" tools={tools} {...toolbarProps} />
}

export { UnmergedFileToolbar }
