import { useState } from 'react'

import type { CommitId, CommitInfo, VersionedFileInfo } from '@/api/models'
import { useQueryVersionedFiles } from '@/api/queries/versionedFiles'
import { ChangesSummary } from '@/common/DiffSummary'
import { FileDiffViewer } from '@/common/FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '@/common/FileViewer/Diff/FilterSelector'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

import { SnapshotDetailsDialogFileList } from '../FileList'
import { CommitSnapshotDetailsDialogDescription } from './Description'

export const COMMIT_SNAPSHOT_DETAILS_DIALOG_KEY = (commitId: CommitId) =>
  `commit_snapshot_details_dialog:${commitId}`

interface CommitSnapshotDetailsDialogProps
  extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The commit that should be displayed.
   */
  commit: CommitInfo
}

/**
 * Dialog that displays details about a given commit.
 *
 * Allows viewing file diffs in detail.
 */
const CommitSnapshotDetailsDialog = (
  props: CommitSnapshotDetailsDialogProps,
) => {
  const { commit, ...dialogProps } = props

  const filterSelector = useDiffFilterSelector()
  const [selectedFile, setSelectedFile] = useState<VersionedFileInfo>()

  const [page, setPage] = useState(0)
  const filesQuery = useQueryVersionedFiles(commit.shortHash, page)

  return (
    <Dialog
      dialogKey={COMMIT_SNAPSHOT_DETAILS_DIALOG_KEY(commit.shortHash)}
      {...propsWithCn(
        dialogProps,
        'max-w-[90%] max-h-[85%]',
        !!selectedFile && 'size-full grid-cols-[430px_1fr]',
      )}
    >
      <DialogContent
        heading={
          <>
            Commit{' '}
            <span className={cn('font-mono font-semibold text-primary-300')}>
              #{commit.shortHash}
            </span>
          </>
        }
        className={cn(
          'grid grid-rows-[max-content_max-content_1fr]',
          !!selectedFile && 'border-r-0 rounded-r-none',
        )}
      >
        <ChangesSummary
          diff={commit.changes}
          compact={false}
          className={cn('text-sm justify-self-start -mt-6 mb-6')}
        />

        <div
          className={cn(
            'grid grid-rows-[max-content_minmax(0,1fr)] gap-y-4 overflow-y-hidden',
          )}
        >
          <CommitSnapshotDetailsDialogDescription commit={commit} />

          <SnapshotDetailsDialogFileList
            snapshot={commit.shortHash}
            filesQuery={filesQuery}
            page={page}
            setPage={setPage}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </DialogContent>

      {!!selectedFile && (
        <div
          className={cn(
            'size-full relative',
            'bg-dark-700/70 backdrop-blur-lg border rounded-r-lg',
            'border-light-50/12 border-t-light-50/22',
          )}
        >
          <FileDiffViewer
            diffScope={{
              type: 'versioned',
              reference: commit.shortHash,
              against: null,
              file: selectedFile,
            }}
            filter={filterSelector.value}
          />

          <DiffFilterSelector
            className={cn('absolute bottom-0 left-half -translate-x-half')}
            store={filterSelector.store}
          />
        </div>
      )}
    </Dialog>
  )
}

const showCommitSnapshotDetailsDialog = (
  commit: CommitInfo,
  props?: Partial<CommitSnapshotDetailsDialogProps>,
) => {
  showDialog(
    COMMIT_SNAPSHOT_DETAILS_DIALOG_KEY(commit.shortHash),
    CommitSnapshotDetailsDialog,
    {
      commit,
      ...props,
    },
  )
}

export {
  CommitSnapshotDetailsDialog,
  showCommitSnapshotDetailsDialog,
  type CommitSnapshotDetailsDialogProps,
}
