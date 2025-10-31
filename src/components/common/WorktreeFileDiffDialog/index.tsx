import type { WorktreeFileInfo } from '@/api/models'
import { showDialog } from '@/context/dialogs'
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

  const viewModeSelector = useViewModeSelector()
  const isSideBySide =
    viewModeSelector.value === 'side_by_side' && file.status === 'unmerged'
  const filterSelector = useDiffFilterSelector()

  return (
    <Dialog
      dialogKey={WORKTREE_FILE_DIFF_DIALOG(file)}
      heading={undefined}
      {...propsWithCn(
        dialogProps,
        'max-w-[70%] max-h-[85%] grid-cols-[1fr] w-full overflow-visible',
        isSideBySide && 'grid-cols-[1fr_1fr] max-w-[90%]',
      )}
      contentProps={propsWithCn(dialogProps.contentProps, 'p-0 bg-dark-900')}
      sideContent={
        isSideBySide && (
          <FileDiffViewer
            filter="both"
            className={cn('border-l border-dark-700')}
            diffScope={{ type: 'unmerged', stage: 'theirs', file }}
          />
        )
      }
    >
      {file.status === 'unmerged' && !isSideBySide ? (
        <FileConflictViewer file={file} />
      ) : (
        <FileDiffViewer
          filter={file.status === 'unmerged' ? 'both' : filterSelector.value}
          diffScope={
            file.status === 'unmerged'
              ? {
                  type: 'unmerged',
                  stage: 'ours',
                  file,
                }
              : { type: 'worktree', file }
          }
        />
      )}

      {file.status === 'unmerged' ? (
        <UnmergedViewSelector
          className={cn('absolute -bottom-3 left-half -translate-x-half')}
          store={viewModeSelector.store}
        />
      ) : (
        <DiffFilterSelector
          className={cn('absolute -bottom-3 left-half -translate-x-half')}
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
  showDialog(WORKTREE_FILE_DIFF_DIALOG(file), WorktreeFileDiffDialog, {
    file,
    ...props,
  })
}

export {
  WorktreeFileDiffDialog,
  showWorktreeFileDiffDialog,
  type WorktreeFileDiffDialogProps,
}
