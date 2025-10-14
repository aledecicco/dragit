import type { StagedFileInfo } from '@/api/models'
import { useUnstageFile } from '@/api/mutations'
import {
  ActionToolbar,
  type ActionToolbarProps,
  type ToolbarTool,
} from '@/lib/ActionToolbar'
import { viewWorktreeFileDiff } from '@/utils/actions'

interface StagedFileToolbarProps extends Partial<ActionToolbarProps> {
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
      mainAction: viewWorktreeFileDiff(file),
    },
    {
      mainAction: unstage,
    },
  ]

  return <ActionToolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { StagedFileToolbar }
