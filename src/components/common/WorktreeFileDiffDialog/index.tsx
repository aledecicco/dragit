import { WorktreeChanges } from '@/widgets/WorktreeChanges'
import { NOT_STAGED_FILE_TYPES } from '@/widgets/WorktreeChanges/NotStaged'
import { NotStagedChangesItem } from '@/widgets/WorktreeChanges/NotStaged/Item'
import { STAGED_FILE_TYPES } from '@/widgets/WorktreeChanges/Staged'
import { StagedChangesItem } from '@/widgets/WorktreeChanges/Staged/Item'

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

export const WORKTREE_FILE_DIFF_DIALOG_KEY = 'worktree_file_diff_dialog'

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
  //
  return (
    <Dialog
      dialogKey={WORKTREE_FILE_DIFF_DIALOG_KEY}
      heading={undefined}
      {...propsWithCn(
        dialogProps,
        'max-w-[90%] max-h-[85%]',
        openFile.status === 'unmerged' &&
          isSideBySide &&
          'max-w-[92%] grid-cols-[300px_1fr]',
      )}
      contentProps={propsWithCn(dialogProps.contentProps, 'p-3')}
      sideContent={
        <div
          className={cn(
            'w-full h-full relative',
            isSideBySide && 'grid grid-cols-2',
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
        </div>
      }
    >
      <div
        className={cn(
          'grid grid-rows-[auto_auto_max-content] gap-y-4 w-full h-full',
        )}
      >
        <WorktreeChanges
          className={cn('h-full min-h-50')}
          label="unstaged changes"
          fileTypes={NOT_STAGED_FILE_TYPES}
          renderFile={(file, position) => (
            <NotStagedChangesItem
              file={file}
              itemIndex={position}
              aria-current={
                file.path === openFile.path && file.status === openFile.status
              }
            />
          )}
        />

        <WorktreeChanges
          className={cn('h-full min-h-50')}
          label="staged changes"
          fileTypes={STAGED_FILE_TYPES}
          renderFile={(file, position) => (
            <StagedChangesItem
              file={file}
              itemIndex={position}
              aria-current={
                file.path === openFile.path && file.status === openFile.status
              }
            />
          )}
        />

        {openFile.status === 'unmerged' ? (
          <UnmergedViewSelector
            className={cn('mt-6 w-full')}
            store={viewModeSelector.store}
          />
        ) : (
          <DiffFilterSelector
            className={cn('mt-6 w-full')}
            store={filterSelector.store}
          />
        )}
      </div>
    </Dialog>
  )
}

const showWorktreeFileDiffDialog = (
  file: WorktreeFileInfo,
  props?: Partial<WorktreeFileDiffDialogProps>,
) => {
  showDialog(WORKTREE_FILE_DIFF_DIALOG_KEY, WorktreeFileDiffDialog, {
    openFile: file,
    ...props,
  })
}

export {
  WorktreeFileDiffDialog,
  showWorktreeFileDiffDialog,
  type WorktreeFileDiffDialogProps,
}
