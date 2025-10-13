import type { WorktreeFileInfo } from '@/api/models'
import { showDialog } from '@/context/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { cn, propsWithCn } from '@/utils/styles'

import { FileDiffViewer } from '../FileDiffViewer'

export const WORKTREE_FILE_DIFF_DIALOG = (file: WorktreeFileInfo) =>
  `snapshot_details_dialog__${file.status}_${file.path}`

interface WorktreeFileDiffDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The file that should be displayed.
   */
  file: WorktreeFileInfo
}

/**
 * Dialog that displays a file diff for a file in the worktree.
 */
const WorktreeFileDiffDialog = (props: WorktreeFileDiffDialogProps) => {
  const { file, ...dialogProps } = props

  return (
    <Dialog
      dialogKey={WORKTREE_FILE_DIFF_DIALOG(file)}
      heading={undefined}
      {...propsWithCn(
        dialogProps,
        'max-w-[70%] max-h-[85%] grid-cols-[1fr] w-full',
        file.status === 'unmerged' && 'grid-cols-[1fr_1fr] max-w-[90%]',
      )}
      contentProps={propsWithCn(dialogProps.contentProps, 'p-0 bg-dark-900')}
      sideContent={
        file.status === 'unmerged' && (
          <FileDiffViewer
            className={cn('border-l border-dark-700')}
            diffScope={{ type: 'unmerged', stage: 'theirs', file }}
          />
        )
      }
    >
      <FileDiffViewer
        diffScope={
          file.status === 'unmerged'
            ? { type: 'unmerged', stage: 'ours', file }
            : { type: 'worktree', file }
        }
      />
    </Dialog>
  )
}

const showWorktreeFileDiffDialog = (
  file: WorktreeFileInfo,
  props?: Partial<WorktreeFileDiffDialogProps>,
) => {
  showDialog(
    WORKTREE_FILE_DIFF_DIALOG(file),
    <WorktreeFileDiffDialog file={file} {...props} />,
  )
}

export {
  WorktreeFileDiffDialog,
  showWorktreeFileDiffDialog,
  type WorktreeFileDiffDialogProps,
}
