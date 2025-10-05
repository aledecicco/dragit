import { match } from 'ts-pattern'

import type { FileInfo } from '@/api/models'
import { showDialog } from '@/context/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { propsWithCn } from '@/utils/styles'

import { FileDiffViewer } from '../FileDiffViewer'

export const WORKTREE_FILE_DIFF_DIALOG = (file: FileInfo) =>
  `snapshot_details_dialog__${file.status}_${file.path}`

interface WorktreeFileDiffDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The file that should be displayed.
   */
  file: FileInfo
}

/**
 * Dialog that displays a file diff for a file in the worktree.
 */
const WorktreeFileDiffDialog = (props: WorktreeFileDiffDialogProps) => {
  const { file, ...dialogProps } = props

  return (
    <Dialog
      dialogKey={WORKTREE_FILE_DIFF_DIALOG(file)}
      showClose={false}
      heading={undefined}
      {...propsWithCn(
        dialogProps,
        'max-w-[70%] max-h-[85%] grid-cols-[1fr] w-full',
      )}
      contentProps={propsWithCn(dialogProps.contentProps, 'p-0 bg-dark-900')}
    >
      {match(file.status)
        .with('unstaged', () => (
          <FileDiffViewer
            filepath={file.path}
            diffScope={{ type: 'unstaged' }}
          />
        ))
        .with('staged', () => (
          <FileDiffViewer filepath={file.path} diffScope={{ type: 'staged' }} />
        ))
        .with('unmerged', () => undefined)
        .with('untracked', () => undefined)
        .exhaustive()}
    </Dialog>
  )
}

const showWorktreeFileDiffDialog = (
  file: FileInfo,
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
