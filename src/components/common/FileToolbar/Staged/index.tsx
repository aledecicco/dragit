import { IconMinus } from '@tabler/icons-react'

import type { StagedFileInfo } from '@/api/models'
import { useRemoveFromIndex } from '@/api/mutations'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface StagedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: StagedFileInfo
}

/**
 * The common set of tools for staged files.
 */
const StagedFileToolbar = (props: StagedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const unstage = useRemoveFromIndex()

  const tools = [
    {
      action: {
        run: () => unstage.mutateAsync({ files: [file.path] }),
        label: {
          idle: 'Unstage',
          running: 'Unstaging',
          success: 'Unstaged',
          error: 'Failed',
        },
        Glyph: IconMinus,
      },
    },
  ]

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { StagedFileToolbar }
