import type { StagedFileInfo } from '@/api/models'
import { useUnstageFile } from '@/api/mutations'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'

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

  const unstage = useUnstageFile(file)
  const tools: ToolbarTool[] = [
    {
      mainAction: unstage,
    },
  ]

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { StagedFileToolbar }
