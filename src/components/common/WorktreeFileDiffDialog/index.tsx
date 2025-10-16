import { IconColumns2Filled, IconColumns3Filled } from '@tabler/icons-react'

import type { WorktreeFileInfo } from '@/api/models'
import { showDialog } from '@/context/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { ToggleGroup } from '@/ui/ToggleGroup'
import { ToggleGroupItem } from '@/ui/ToggleGroup/Item'
import { useToggleHandler } from '@/ui/ToggleGroup/utils'
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

const diffViewModes = ['inline', 'side_by_side'] as const

/**
 * Dialog that displays a file diff for a file in the worktree.
 */
const WorktreeFileDiffDialog = (props: WorktreeFileDiffDialogProps) => {
  const { file, ...dialogProps } = props

  const { store, value } = useToggleHandler(diffViewModes, 'side_by_side')
  const isSideBySide = value === 'side_by_side' && file.status === 'unmerged'

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
            className={cn('border-l border-dark-700')}
            diffScope={{ type: 'unmerged', stage: 'theirs', file }}
          />
        )
      }
    >
      <FileDiffViewer
        diffScope={
          file.status === 'unmerged'
            ? {
                type: 'unmerged',
                stage: isSideBySide ? 'ours' : 'both',
                file,
              }
            : { type: 'worktree', file }
        }
      />

      {file.status === 'unmerged' && (
        <ToggleGroup
          className="absolute -bottom-3 left-half -translate-x-half"
          radioProps={{ store }}
        >
          <ToggleGroupItem
            value="side_by_side"
            compact
            label="View side by side"
            Glyph={IconColumns2Filled}
          />

          <ToggleGroupItem
            value="inline"
            compact
            label="View inline"
            Glyph={IconColumns3Filled}
            iconProps={{ className: cn('rotate-90') }}
          />
        </ToggleGroup>
      )}
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
