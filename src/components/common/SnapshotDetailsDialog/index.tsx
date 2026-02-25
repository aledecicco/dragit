import { useState } from 'react'
import { match } from 'ts-pattern'

import type { SnapshotId, SnapshotInfo } from '@/api/models'
import {
  SNAPSHOT_FILES_PAGE_SIZE,
  useQuerySnapshotFiles,
} from '@/api/queries/snapshotFiles'
import { useNeedsPagination } from '@/api/utils'
import { ChangesSummary } from '@/common/DiffSummary'
import { Pagination } from '@/lib/Pagination'
import { showDialog } from '@/state/dialogs'
import { Chip } from '@/ui/Chip'
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
      sideContent={
        fileSelector.selectedFile && (
          <div className={cn('w-full h-full relative')}>
            <FileDiffViewer
              diffScope={{
                type: 'snapshot',
                snapshotId: snapshotInfo.id,
                file: fileSelector.selectedFile,
              }}
              filter={filterSelector.value}
            />

            {fileSelector.selectedFile && (
              <DiffFilterSelector
                className={cn('absolute bottom-0 left-half -translate-x-half')}
                store={filterSelector.store}
              />
            )}
          </div>
        )
      }
      {...propsWithCn(dialogProps, 'max-w-[90%] max-h-[85%]')}
      contentProps={propsWithCn(
        dialogProps.contentProps,
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <ChangesSummary
        diff={snapshotInfo.changes}
        compact={false}
        className={cn('text-sm justify-self-center -mt-6 mb-6')}
      />

      <div
        className={cn(
          'grid grid-rows-[max-content_1fr] gap-y-4 overflow-y-hidden',
        )}
      >
        <SnapshotDialogDescription snapshotInfo={snapshotInfo} />

        <div
          className={cn(
            'flex flex-col gap-y-1 overflow-hidden',
            'h-full min-h-50',
          )}
        >
          <div
            className={cn(
              'text-sm text-light-600 text-start',
              'py-2 flex flex-row gap-x-2 items-center',
            )}
          >
            <p>Files</p>

            {showPagination ? (
              <Pagination
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
            ) : (
              <Chip size="sm">{filesQuery.data?.items.length ?? '...'}</Chip>
            )}
          </div>

          <SnapshotDialogFileList
            filesQuery={filesQuery}
            store={fileSelector.store}
            className={cn('h-full overflow-hidden')}
          />
        </div>
      </div>
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
