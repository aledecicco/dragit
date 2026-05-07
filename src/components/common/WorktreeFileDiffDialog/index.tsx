import type { WorktreeFileInfo } from '@/api/models'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { cn, propsWithCn } from '@/utils/styles'

import { FileConflictViewer } from '../FileViewer/Conflict'
import { FileDiffViewer } from '../FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '../FileViewer/Diff/FilterSelector'
import {
  UnmergedViewSelector,
  useViewModeSelector,
} from './UnmergedViewSelector'

export const WORKTREE_FILE_DIFF_DIALOG_KEY = (filepath: string) =>
  `worktree_file_diff_dialog:${filepath}`

interface WorktreeFileDiffDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The file that should be displayed.
   */
  openFile: WorktreeFileInfo
}

/**
 * Dialog that displays a file diff for a file in the worktree.
 */
const WorktreeFileDiffDialog = (props: WorktreeFileDiffDialogProps) => {
  const { openFile, ...dialogProps } = props

  const viewModeSelector = useViewModeSelector()
  const isSideBySide =
    viewModeSelector.value === 'side_by_side' && openFile.status === 'unmerged'
  const filterSelector = useDiffFilterSelector()

  return (
    <Dialog
      dialogKey={WORKTREE_FILE_DIFF_DIALOG_KEY(openFile.path)}
      {...propsWithCn(
        dialogProps,
        'max-w-[80%] max-h-[85%] w-full h-full grid-cols-1',
        isSideBySide && 'grid-cols-2',
      )}
    >
      {openFile.status === 'unmerged' && !isSideBySide ? (
        <FileConflictViewer file={openFile} />
      ) : (
        <FileDiffViewer
          filter={
            openFile.status === 'unmerged' ? 'both' : filterSelector.value
          }
          diffScope={
            openFile.status === 'unmerged'
              ? {
                  type: 'unmerged',
                  stage: 'ours',
                  file: openFile,
                }
              : { type: 'worktree', file: openFile }
          }
        />
      )}

      {isSideBySide && (
        <FileDiffViewer
          filter="both"
          className={cn('border-l border-dark-700')}
          diffScope={{ type: 'unmerged', stage: 'theirs', file: openFile }}
        />
      )}

      {openFile.status === 'unmerged' ? (
        <UnmergedViewSelector
          className={cn('absolute bottom-0 left-half -translate-x-half')}
          store={viewModeSelector.store}
        />
      ) : (
        <DiffFilterSelector
          className={cn('absolute bottom-0 left-half -translate-x-half')}
          store={filterSelector.store}
        />
      )}
    </Dialog>
  )
}

const showWorktreeFileDiffDialog = (
  file: WorktreeFileInfo,
  props?: Partial<WorktreeFileDiffDialogProps>,
) => {
  showDialog(WORKTREE_FILE_DIFF_DIALOG_KEY(file.path), WorktreeFileDiffDialog, {
    openFile: file,
    ...props,
  })
}

export {
  WorktreeFileDiffDialog,
  showWorktreeFileDiffDialog,
  type WorktreeFileDiffDialogProps,
}
