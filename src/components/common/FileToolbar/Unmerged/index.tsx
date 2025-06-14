import { IconCheck, IconTrash } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import type { UnmergedFileInfo } from '@/api/models'
import { useAddToIndex, useRemoveFromTree } from '@/api/mutations'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface UnmergedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: UnmergedFileInfo
}

/**
 * The common set of tools for unmerged files.
 */
const UnmergedFileToolbar = (props: UnmergedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  const tools = [
    {
      action: {
        run: () => stage.mutateAsync({ files: [file.path] }),
        label: {
          idle: 'Mark as resolved',
          running: 'Resolving',
          success: 'Resolved',
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

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UnmergedFileToolbar }
