import { match, P } from 'ts-pattern'

import type { UnmergedFileInfo } from '@/api/models'
import { useMarkAsResolved } from '@/api/mutations'
import { useMarkAsRemoved } from '@/api/mutations/removeFromTree'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'
import { viewWorktreeFileDiff } from '@/utils/actions'

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
  const resolve = useMarkAsResolved(file)
  const remove = useMarkAsRemoved(file)

  const tools: ToolbarTool[] = [
    {
      mainAction: viewWorktreeFileDiff(file),
    },
    {
      mainAction: resolve,
    },
    ...match(file.changes)
      .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => [
        {
          mainAction: remove,
        },
      ])
      .otherwise(() => []),
  ]

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UnmergedFileToolbar }
