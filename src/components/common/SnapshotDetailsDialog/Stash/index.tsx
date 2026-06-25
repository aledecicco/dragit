import { useState } from 'react'

import type { CommitId, StashInfo, VersionedFileInfo } from '@/api/models'
import { useQueryStashFiles } from '@/api/queries/stashFiles'
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
import { StashSnapshotDetailsDialogDescription } from './Description'

export const STASH_SNAPSHOT_DETAILS_DIALOG_KEY = (commitId: CommitId) =>
  `stash_snapshot_details_dialog:${commitId}`

interface StashSnapshotDetailsDialogProps
  extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The stash that should be displayed.
   */
  stash: StashInfo
}

/**
 * Dialog that displays details about a given stash.
 *
 * Allows viewing file diffs in detail.
 */
const StashSnapshotDetailsDialog = (props: StashSnapshotDetailsDialogProps) => {
  const { stash, ...dialogProps } = props

  const filterSelector = useDiffFilterSelector()
  const [selectedFile, setSelectedFile] = useState<VersionedFileInfo>()

  const [page, setPage] = useState(0)
  const filesQuery = useQueryStashFiles(stash.id, page)

  return (
    <Dialog
      dialogKey={STASH_SNAPSHOT_DETAILS_DIALOG_KEY(stash.id)}
      {...propsWithCn(
        dialogProps,
        'max-w-[90%] max-h-[85%]',
        !!selectedFile && 'w-full h-full grid-cols-[430px_1fr]',
      )}
    >
      <DialogContent
        heading={
          <>
            Stash{' '}
            <span className={cn('font-semibold')}>#{stash.stashNumber}</span>
          </>
        }
        className={cn('grid grid-rows-[max-content_max-content_1fr]')}
      >
        <ChangesSummary
          diff={stash.changes}
          compact={false}
          className={cn('text-sm justify-self-start -mt-6 mb-6')}
        />

        <div
          className={cn(
            'grid grid-rows-[max-content_1fr] gap-y-4 overflow-y-hidden',
          )}
        >
          <StashSnapshotDetailsDialogDescription stash={stash} />

          <SnapshotDetailsDialogFileList
            snapshot={stash.id}
            filesQuery={filesQuery}
            page={page}
            setPage={setPage}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </DialogContent>

      {!!selectedFile && (
        <div className={cn('w-full h-full relative')}>
          <FileDiffViewer
            diffScope={{
              type: 'versioned',
              reference: stash.id,
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

const showStashSnapshotDetailsDialog = (
  stash: StashInfo,
  props?: Partial<StashSnapshotDetailsDialogProps>,
) => {
  showDialog(
    STASH_SNAPSHOT_DETAILS_DIALOG_KEY(stash.id),
    StashSnapshotDetailsDialog,
    {
      stash,
      ...props,
    },
  )
}

export {
  StashSnapshotDetailsDialog,
  showStashSnapshotDetailsDialog,
  type StashSnapshotDetailsDialogProps,
}
