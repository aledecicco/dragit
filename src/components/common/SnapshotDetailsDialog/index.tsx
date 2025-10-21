import { useState } from 'react'
import { match } from 'ts-pattern'

import type { SnapshotId, SnapshotInfo } from '@/api/models'
import { SNAPSHOT_FILES_PAGE_SIZE, useQuerySnapshotFiles } from '@/api/queries'
import { useNeedsPagination } from '@/api/utils'
import { ChangesSummary } from '@/common/DiffSummary'
import { showDialog } from '@/context/dialogs'
import { Pagination } from '@/lib/Pagination'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { cn, propsWithCn } from '@/utils/styles'

import { FileDiffViewer } from '../FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '../FileViewer/Diff/FilterSelector'
import { SnapshotDialogDescription } from './Description'
import { SnapshotDialogFileList, useFileSelector } from './FileList'

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

  const [page, setPage] = useState(0)

  const snapshotName = match(snapshotInfo)
    .with(
      { type: 'stash' },
      (snapshotInfo) => `Stash #${snapshotInfo.stashNumber}`,
    )
    .with({ type: 'commit' }, (snapshotInfo) => `#${snapshotInfo.shortHash}`)
    .exhaustive()

  const filesQuery = useQuerySnapshotFiles(snapshotInfo, page)
  const showPagination = useNeedsPagination(filesQuery, page)
  const fileSelector = useFileSelector(filesQuery.data)

  const filterSelector = useDiffFilterSelector()

  return (
    <Dialog
      dialogKey={SNAPSHOT_DETAILS_DIALOG_KEY(snapshotInfo.id)}
      heading={snapshotName}
      contentProps={{
        className: cn('grid grid-rows-[max-content_max-content]'),
      }}
      sideContent={
        fileSelector.selectedFile && (
          <FileDiffViewer
            diffScope={{
              type: 'snapshot',
              snapshotId: snapshotInfo.id,
              file: fileSelector.selectedFile,
            }}
            filter={filterSelector.value}
          />
        )
      }
      {...propsWithCn(dialogProps, 'max-w-[90%] max-h-[85%] overflow-visible')}
    >
      <ChangesSummary
        diff={snapshotInfo.changes}
        compact={false}
        className={cn('text-sm justify-self-center -mt-6 mb-6')}
      />

      <div
        className={cn(
          'grid gap-y-6 overflow-y-hidden grid-rows-[max-content_1fr]',
        )}
      >
        <SnapshotDialogDescription snapshotInfo={snapshotInfo} />

        <SnapshotDialogFileList
          store={fileSelector.store}
          snapshotInfo={snapshotInfo}
          filesQuery={filesQuery}
          className={cn('grid gap-y-2 overflow-y-hidden')}
        />
      </div>

      {showPagination && (
        <Pagination
          className={cn('mt-6 -mb-2')}
          page={page}
          pageSize={SNAPSHOT_FILES_PAGE_SIZE}
          hasNext={!!filesQuery.data?.hasNext}
          setPrevPage={() => {
            setPage((_page) => _page - 1)
          }}
          setNextPage={() => {
            setPage((_page) => _page + 1)
          }}
        />
      )}

      {fileSelector.selectedFile && (
        <DiffFilterSelector
          className="absolute -bottom-3 left-[calc(50%+215px)] -translate-x-half z-1"
          store={filterSelector.store}
        />
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
    <SnapshotDetailsDialog snapshotInfo={snapshotInfo} {...props} />,
  )
}

export {
  SnapshotDetailsDialog,
  showSnapshotDetailsDialog,
  type SnapshotDetailsDialogProps,
}
