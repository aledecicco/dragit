import type { UntrackedFileInfo } from '@/api/models'
import { useStageFile } from '@/api/mutations'
import {
  ActionToolbar,
  type ActionToolbarProps,
  type ToolbarTool,
} from '@/lib/ActionToolbar'
import { viewWorktreeFileDiff } from '@/utils/actions'

interface UntrackedFileToolbarProps extends Partial<ActionToolbarProps> {
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

  return <ActionToolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UntrackedFileToolbar }
