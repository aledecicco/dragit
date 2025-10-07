import { useState } from 'react'
import * as Ariakit from '@ariakit/react'

import type { SnapshotId, SnapshotInfo } from '@/api/models'
import { SNAPSHOT_FILES_PAGE_SIZE, useQuerySnapshotFiles } from '@/api/queries'
import { ChangesSummary } from '@/common/DiffSummary'
import { FileDiffViewer } from '@/common/FileDiffViewer'
import { ProfilePicture } from '@/common/ProfilePicture'
import { showDialog } from '@/context/dialogs'
import { useHandlePageSync, useNeedsPagination } from '@/context/pages'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'
import { mapFn } from '@/utils/types'

import { SnapshotDetailsDialogItem } from './Item'

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

  const timeAgo = useDateDifference(snapshotInfo.timestamp)
  const [page, setPage] = useState(0)
  const clearPage = () => {
    setPage(0)
  }

  const snapshotName =
    'stashNumber' in snapshotInfo
      ? `Stash #${snapshotInfo.stashNumber}`
      : `#${snapshotInfo.shortHash}`

  const filesQuery = useQuerySnapshotFiles(snapshotInfo.id, page)
  const showPagination = useNeedsPagination(filesQuery, page)
  useHandlePageSync(filesQuery, page, clearPage)

  const store = Ariakit.useCheckboxStore()
  const selectedFile = Ariakit.useStoreState(store, 'value')

  return (
    <Dialog
      dialogKey={SNAPSHOT_DETAILS_DIALOG_KEY(snapshotInfo.id)}
      heading={snapshotName}
      contentProps={{
        className: cn('grid grid-rows-[max-content_max-content]'),
      }}
      sideContent={
        typeof selectedFile === 'string' ? (
          <FileDiffViewer
            filepath={selectedFile}
            diffScope={{ type: 'snapshot', snapshotId: snapshotInfo.id }}
          />
        ) : undefined
      }
      {...propsWithCn(dialogProps, 'max-w-[90%] max-h-[85%]')}
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
        <div>
          <div
            className={cn(
              'border-1 border-dark-50 rounded-sm',
              'bg-dark-500 text-light-400 text-sm whitespace-pre-wrap',
              'p-3 max-h-40 overflow-y-auto',
              'mb-2',
              !snapshotInfo.message && 'italic text-light-950',
            )}
          >
            {snapshotInfo.message ?? 'No message.'}
          </div>

          {'authorName' in snapshotInfo ? (
            <div className={cn('flex flex-row items-center gap-x-1')}>
              <ProfilePicture username={snapshotInfo.authorName} size="md" />
              <p className={cn('text-xs text-light-950')}>
                {snapshotInfo.authorName}, {timeAgo}
              </p>
            </div>
          ) : (
            <p className={cn('text-xs text-light-950 first-letter:capitalize')}>
              {timeAgo}
            </p>
          )}
        </div>

        <div className={cn('grid gap-y-2 overflow-y-hidden')}>
          <div
            className={cn(
              'overflow-y-hidden',
              'bg-dark-700 border-1 border-dark-300 rounded-lg',
            )}
          >
            <Ariakit.CheckboxProvider store={store}>
              <QueryList
                name="modified files"
                query={filesQuery}
                getItems={(d) => d.items}
                renderItem={(file) => <SnapshotDetailsDialogItem file={file} />}
                itemSize={48}
                size="md"
                options={mapFn(filesQuery.data, (page) => ({
                  getItemKey: (index: number) => page.items[index].path,
                }))}
                placeholdersCount={Math.min(
                  10,
                  snapshotInfo.changes?.filesCount
                    ? snapshotInfo.changes.filesCount
                    : 1,
                )}
              />
            </Ariakit.CheckboxProvider>
          </div>
        </div>
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
