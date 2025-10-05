import type { UntrackedFileInfo } from '@/api/models'
import { useStageFile } from '@/api/mutations'
import { Toolbar, type ToolbarProps, type ToolbarTool } from '@/ui/Toolbar'
import { viewWorktreeFileDiff } from '@/utils/actions'

interface UntrackedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: UntrackedFileInfo
}

/**
 * The common set of tools for untracked files.
 */
const UntrackedFileToolbar = (props: UntrackedFileToolbarProps) => {
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

export { UntrackedFileToolbar }
