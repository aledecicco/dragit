import { useState } from 'react'
import { match } from 'ts-pattern'

import type { SnapshotId, SnapshotInfo, VersionedFileInfo } from '@/api/models'
import { ChangesSummary } from '@/common/DiffSummary'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

import { FileDiffViewer } from '../FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '../FileViewer/Diff/FilterSelector'
import { SnapshotDialogDescription } from './Description'
import { SnapshotDialogFileList } from './FileList'

export const SNAPSHOT_DETAILS_DIALOG_KEY = (snapshotId: SnapshotId) =>
  `snapshot_details_dialog:${snapshotId}`

interface SnapshotDetailsDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The snapshot that should be displayed.
   */
  snapshotInfo: SnapshotInfo
}

/**
 * Dialog that displays details about a given snapshot.
 *
 * Allows viewing file diffs in detail.
 */
const SnapshotDetailsDialog = (props: SnapshotDetailsDialogProps) => {
  const { snapshotInfo, ...dialogProps } = props

  const filterSelector = useDiffFilterSelector()
  const [selectedFile, setSelectedFile] = useState<VersionedFileInfo>()

  return (
    <Dialog
      dialogKey={SNAPSHOT_DETAILS_DIALOG_KEY(snapshotInfo.id)}
      {...propsWithCn(
        dialogProps,
        'max-w-[90%] max-h-[85%]',
        !!selectedFile && 'w-full h-full grid-cols-[430px_1fr]',
      )}
    >
      <DialogContent
        heading={match(snapshotInfo)
          .with({ type: 'stash' }, (snapshotInfo) => (
            <>
              Stash{' '}
              <span className={cn('font-semibold')}>
                #{snapshotInfo.stashNumber}
              </span>
            </>
          ))
          .with({ type: 'commit' }, (snapshotInfo) => (
            <>
              Commit{' '}
              <span className={cn('font-semibold')}>
                #{snapshotInfo.shortHash}
              </span>
            </>
          ))
          .exhaustive()}
        className={cn('grid grid-rows-[max-content_max-content_1fr]')}
      >
        <ChangesSummary
          diff={snapshotInfo.changes}
          compact={false}
          className={cn('text-sm justify-self-start -mt-6 mb-6')}
        />

        <div
          className={cn(
            'grid grid-rows-[max-content_1fr] gap-y-4 overflow-y-hidden',
          )}
        >
          <SnapshotDialogDescription snapshotInfo={snapshotInfo} />

          <SnapshotDialogFileList
            snapshotInfo={snapshotInfo}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </DialogContent>

      {!!selectedFile && (
        <div className={cn('w-full h-full relative')}>
          <FileDiffViewer
            diffScope={{
              type: 'snapshot',
              snapshotId: snapshotInfo.id,
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

const showSnapshotDetailsDialog = (
  snapshotInfo: SnapshotInfo,
  props?: Partial<SnapshotDetailsDialogProps>,
) => {
  showDialog(
    SNAPSHOT_DETAILS_DIALOG_KEY(snapshotInfo.id),
    SnapshotDetailsDialog,
    { snapshotInfo, ...props },
  )
}

export {
  SnapshotDetailsDialog,
  showSnapshotDetailsDialog,
  type SnapshotDetailsDialogProps,
}
