import { useState } from 'react'

import type { Reference, VersionedFileInfo } from '@/api/models'
import { useQueryDiffSummary } from '@/api/queries/diffSummary'
import { useQueryVersionedFiles } from '@/api/queries/versionedFiles'
import { ChangesSummary } from '@/common/DiffSummary'
import { FileDiffViewer } from '@/common/FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '@/common/FileViewer/Diff/FilterSelector'
import { RefSelector } from '@/common/RefSelector'
import { QueryLoader } from '@/lib/QueryLoader'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

import { SnapshotDetailsDialogFileList } from '../FileList'

export const COMPARISON_SNAPSHOT_DETAILS_DIALOG_KEY =
  'comparison_snapshot_details_dialog'

interface ComparisonSnapshotDetailsDialogProps
  extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The (initial) reference that should be displayed.
   */
  initialReference: Reference

  /**
   * The (initial) reference to compare it against.
   */
  initialAgainst?: Reference
}

/**
 * Dialog that displays details about a given reference being compared against another.
 *
 * Allows viewing file diffs in detail.
 */
const ComparisonSnapshotDetailsDialog = (
  props: ComparisonSnapshotDetailsDialogProps,
) => {
  const { initialReference, initialAgainst, ...dialogProps } = props

  const [reference, setReference] = useState(initialReference)
  const [against, setAgainst] = useState(initialAgainst)

  const filterSelector = useDiffFilterSelector()
  const [selectedFile, setSelectedFile] = useState<VersionedFileInfo>()

  const [page, setPage] = useState(0)
  const changesQuery = useQueryDiffSummary(reference.refName, against?.refName)
  const filesQuery = useQueryVersionedFiles(
    reference.refName,
    page,
    against?.refName,
  )

  return (
    <Dialog
      dialogKey={COMPARISON_SNAPSHOT_DETAILS_DIALOG_KEY}
      {...propsWithCn(
        dialogProps,
        'max-w-[90%] max-h-[85%]',
        !!selectedFile && 'size-full grid-cols-[430px_1fr]',
      )}
    >
      <DialogContent
        heading={
          <div
            className={cn(
              'flex flex-row items-center gap-2 mb-2 pr-4 flex-wrap',
            )}
          >
            <div className={cn('flex flex-row items-center gap-2')}>
              Compare{' '}
              <RefSelector
                placeholder="..."
                size="md"
                className={cn('px-1 py-0.5 text-lg max-w-70')}
                popoverProps={{
                  className: cn('min-w-65 z-8'),
                }}
                variant="filled"
                reference={reference}
                onSelectBranch={(name) =>
                  setReference({
                    type: 'branch',
                    refName: name,
                  })
                }
                onSelectTag={(name) =>
                  setReference({ type: 'tag', refName: name })
                }
                onSelectCommit={(hash) =>
                  setReference({ type: 'commit', refName: hash })
                }
              />
            </div>

            <div className={cn('flex flex-row items-center gap-2')}>
              against{' '}
              <RefSelector
                placeholder="..."
                size="md"
                className={cn('px-1 py-0.5 text-lg max-w-70')}
                popoverProps={{
                  className: cn('min-w-65 z-8'),
                }}
                variant="filled"
                reference={against}
                onSelectBranch={(name) =>
                  setAgainst({
                    type: 'branch',
                    refName: name,
                  })
                }
                onSelectTag={(name) =>
                  setAgainst({ type: 'tag', refName: name })
                }
                onSelectCommit={(hash) =>
                  setAgainst({ type: 'commit', refName: hash })
                }
              />
            </div>
          </div>
        }
        className={cn(
          'grid grid-rows-[max-content_max-content_1fr]',
          !!selectedFile && 'border-r-0 rounded-r-none',
        )}
      >
        {against ? (
          <QueryLoader query={changesQuery}>
            {(diff) => (
              <ChangesSummary
                diff={diff}
                compact={false}
                className={cn('text-sm justify-self-start -mt-6 mb-6')}
              />
            )}
          </QueryLoader>
        ) : (
          <p
            className={cn(
              'text-sm bg-dark-700 text-light-950/50 italic select-none',
              'p-3 rounded-md h-full',
            )}
          >
            Choose a ref to compare against to view changes.
          </p>
        )}

        {against && (
          <div className={cn('grid grid-rows-1 gap-y-4 overflow-y-hidden')}>
            <SnapshotDetailsDialogFileList
              snapshot={reference.refName}
              against={against?.refName}
              filesQuery={filesQuery}
              page={page}
              setPage={setPage}
              setSelectedFile={setSelectedFile}
            />
          </div>
        )}
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
              reference: reference.refName,
              against: against?.refName ?? null,
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

const showComparisonSnapshotDetailsDialog = (
  reference: Reference,
  against?: Reference,
  props?: Partial<ComparisonSnapshotDetailsDialogProps>,
) => {
  showDialog(
    COMPARISON_SNAPSHOT_DETAILS_DIALOG_KEY,
    ComparisonSnapshotDetailsDialog,
    {
      initialReference: reference,
      initialAgainst: against,
      ...props,
    },
  )
}

export {
  ComparisonSnapshotDetailsDialog,
  showComparisonSnapshotDetailsDialog,
  type ComparisonSnapshotDetailsDialogProps,
}
