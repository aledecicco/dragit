import { IconPlus } from '@tabler/icons-react'

import type { UnstagedFileInfo } from '@/api/models'
import { useAddToIndex } from '@/api/mutations'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface UnstagedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: UnstagedFileInfo
}

/**
 * The common set of tools for unstaged files.
 */
const UnstagedFileToolbar = (props: UnstagedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const stage = useAddToIndex()

  const tools = [
    {
      action: {
        run: () => stage.mutateAsync({ files: [file.path] }),
        label: {
          idle: 'Stage',
          running: 'Staging',
          success: 'Staged',
          error: 'Failed',
        },
        Glyph: IconPlus,
      },
    },
  ]

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UnstagedFileToolbar }
