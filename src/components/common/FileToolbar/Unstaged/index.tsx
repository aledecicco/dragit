import type { UnstagedFileInfo } from '@/api/models'
import { useStageFile } from '@/api/mutations'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'
import { viewWorktreeFileDiff } from '@/utils/actions'

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

  const stage = useStageFile(file)
  const tools: ToolbarTool[] = [
    {
      mainAction: viewWorktreeFileDiff(file),
    },
    {
      mainAction: stage,
    },
  ]

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UnstagedFileToolbar }
