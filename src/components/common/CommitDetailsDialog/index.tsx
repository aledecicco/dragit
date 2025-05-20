import { useMemo, useState } from 'react'

import type { CommitId, CommitInfo } from '@api/models'
import { useQueryCommitFiles } from '@api/queries'
import { getPageItems } from '@api/utils'
import { ChangesSummary } from '@common/DiffSummary'
import { showDialog } from '@context/dialogs'
import { QueryList } from '@lib/QueryList'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { CommitDetailsDialogItem } from './Item'

export const COMMIT_DETAILS_DIALOG_KEY = (commitId: CommitId) =>
  `commit_details_dialog_${commitId}`

interface CommitDetailsDialogProps extends Omit<DialogProps, 'dialogKey'> {
  commitInfo: CommitInfo
}

const CommitDetailsDialog = (props: CommitDetailsDialogProps) => {
  const { commitInfo, ...dialogProps } = props

  const [page, setPage] = useState(0)
  const filesQuery = useQueryCommitFiles(commitInfo.hash, page)

  const virtualizerOptions = useMemo(() => {
    return mapFn(filesQuery.data, (page) => ({
      getItemKey: (index: number) => page.items[index].path,
    }))
  }, [filesQuery.data])

  return (
    <Dialog
      dialogKey={COMMIT_DETAILS_DIALOG_KEY(commitInfo.hash)}
      heading={`#${commitInfo.shortHash}`}
      {...dialogProps}
    >
      {commitInfo.changes && (
        <ChangesSummary
          diff={commitInfo.changes}
          compact={false}
          className={cn(' self-center -mt-6 mb-4')}
        />
      )}

      <div className={cn('h-60 bg-dark-700 overflow-y-hidden mb-4')}>
        <QueryList
          query={filesQuery}
          RenderItem={CommitDetailsDialogItem}
          name="files"
          getItems={getPageItems}
          itemSize={48}
          size="sm"
          options={virtualizerOptions}
        />
      </div>
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
