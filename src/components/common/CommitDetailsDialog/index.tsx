import * as Ariakit from '@ariakit/react'
import { useCallback, useMemo, useState } from 'react'

import type { CommitId, CommitInfo } from '@api/models'
import { COMMIT_FILES_PAGE_SIZE, useQueryCommitFiles } from '@api/queries'
import { getPageItems } from '@api/utils'
import { ChangesSummary } from '@common/DiffSummary'
import { FileDiffViewer } from '@common/FileDiffViewer'
import { ProfilePicture } from '@common/ProfilePicture'
import { showDialog } from '@context/dialogs'
import { useHandlePageSync, useNeedsPagination } from '@context/pages'
import { Pagination } from '@lib/Pagination'
import { QueryList } from '@lib/QueryList'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { cn } from '@utils/styles'
import { useDateDifference } from '@utils/time'
import { mapFn } from '@utils/types'
import { CommitDetailsDialogItem } from './Item'

export const COMMIT_DETAILS_DIALOG_KEY = (commitId: CommitId) =>
  `commit_details_dialog_${commitId}`

interface CommitDetailsDialogProps extends Omit<DialogProps, 'dialogKey'> {
  commitInfo: CommitInfo
}

const CommitDetailsDialog = (props: CommitDetailsDialogProps) => {
  const { commitInfo, ...dialogProps } = props
  const timeAgo = useDateDifference(commitInfo.timestamp)

  const [page, setPage] = useState(0)
  const clearPage = useCallback(() => {
    setPage(0)
  }, [])

  const filesQuery = useQueryCommitFiles(commitInfo.hash, page)
  const showPagination = useNeedsPagination(filesQuery, page)
  useHandlePageSync(filesQuery, page, clearPage)

  const virtualizerOptions = useMemo(() => {
    return mapFn(filesQuery.data, (page) => ({
      getItemKey: (index: number) => page.items[index].path,
    }))
  }, [filesQuery.data])

  const store = Ariakit.useCheckboxStore()
  const selectedFile = Ariakit.useStoreState(store, 'value')

  return (
    <Dialog
      dialogKey={COMMIT_DETAILS_DIALOG_KEY(commitInfo.hash)}
      heading={`#${commitInfo.shortHash}`}
      contentProps={{
        className: cn('grid-rows-[max-content_max-content]'),
      }}
      sideContent={
        typeof selectedFile === 'string' ? (
          <FileDiffViewer reference={commitInfo.hash} filepath={selectedFile} />
        ) : undefined
      }
      {...dialogProps}
    >
      <ChangesSummary
        diff={commitInfo.changes}
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
              !commitInfo.message && 'italic text-light-950',
            )}
          >
            {commitInfo.message ?? 'No message.'}
          </div>

          <div className={cn('flex flex-row items-center gap-x-1')}>
            <ProfilePicture username={commitInfo.authorName} size="md" />
            <p className={cn('text-xs text-light-950')}>
              {commitInfo.authorName}, {timeAgo}
            </p>
          </div>
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
                query={filesQuery}
                RenderItem={CommitDetailsDialogItem}
                name="modified files"
                getItems={getPageItems}
                itemSize={48}
                size="md"
                options={virtualizerOptions}
                placeholdersCount={Math.min(
                  10,
                  commitInfo.changes?.filesCount
                    ? commitInfo.changes.filesCount
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
          pageSize={COMMIT_FILES_PAGE_SIZE}
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

const showCommitDetailsDialog = (
  commitInfo: CommitInfo,
  props?: Partial<CommitDetailsDialogProps>,
) => {
  showDialog(
    COMMIT_DETAILS_DIALOG_KEY(commitInfo.hash),
    <CommitDetailsDialog commitInfo={commitInfo} {...props} />,
  )
}

export {
  CommitDetailsDialog,
  showCommitDetailsDialog,
  type CommitDetailsDialogProps,
}
