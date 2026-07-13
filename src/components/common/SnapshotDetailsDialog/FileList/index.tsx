import type { ComponentProps, Dispatch, SetStateAction } from 'react'
import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { IconFileDiff } from '@tabler/icons-react'

import type { Page, RefName, VersionedFileInfo } from '@/api/models'
import { VERSIONED_FILES_PAGE_SIZE } from '@/api/queries/versionedFiles'
import { useNeedsPagination } from '@/api/utils'
import { useGetVersionedFilesInteractions } from '@/interactions/file'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { SnapshotDetailsDialogFileItem } from './Item'

interface SnapshotDetailsDialogFileListProps extends ComponentProps<'div'> {
  /**
   * The snapshot for which to display the files (used for interactions).
   */
  snapshot: RefName

  /**
   * The snapshot the files are being compared against.
   */
  against?: RefName

  /**
   * The query result providing the current page of files.
   */
  filesQuery: UseQueryResult<Page<VersionedFileInfo>>

  /**
   * The current page index.
   */
  page: number

  /**
   * Setter for the page index.
   */
  setPage: Dispatch<SetStateAction<number>>

  /**
   * Callback to set the currently selected file, which will be shown in the diff viewer.
   */
  setSelectedFile: (file: VersionedFileInfo | undefined) => void
}

/**
 * Displays a list of files that can be selected.
 */
const SnapshotDetailsDialogFileList = (
  props: SnapshotDetailsDialogFileListProps,
) => {
  const {
    snapshot,
    against,
    filesQuery,
    page,
    setPage,
    setSelectedFile,
    ...divProps
  } = props

  const showPagination = useNeedsPagination(filesQuery, page)

  const radio = Ariakit.useRadioStore({
    focusLoop: false,
    setValue: (value) => {
      setSelectedFile(
        filesQuery.data?.items.find((file) => file.path === value),
      )
    },
  })

  const getInteractions = useGetVersionedFilesInteractions(snapshot)

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-col gap-y-1 overflow-hidden',
        'h-full min-h-50',
      )}
    >
      <div
        className={cn(
          'text-sm text-light-800 text-start',
          'py-2 flex flex-row gap-x-2 items-center',
        )}
      >
        <p className={cn('uppercase text-2xs font-semibold tracking-widest')}>
          Files
        </p>

        {showPagination ? (
          <Pagination
            page={page}
            pageSize={VERSIONED_FILES_PAGE_SIZE}
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

      <Ariakit.RadioProvider store={radio}>
        <Ariakit.RadioGroup
          focusable
          className={cn(
            'h-full overflow-hidden',
            'bg-dark-800 rounded-md',
            'border border-transparent',
            'focus:border-dark-100',
          )}
        >
          <InteractiveSelection
            items={filesQuery.data?.items ?? []}
            getInteractions={against ? () => [] : getInteractions}
          >
            <QueryList
              name="modified files"
              emptyIcon={IconFileDiff}
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <SnapshotDetailsDialogFileItem
                  file={file}
                  snapshot={snapshot}
                  against={against}
                  itemIndex={position}
                />
              )}
              itemSize={48}
              size="md"
              options={mapFn(filesQuery.data, (page) => ({
                getItemKey: (index: number) => page.items[index].path,
              }))}
            />
          </InteractiveSelection>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
    </div>
  )
}

export {
  SnapshotDetailsDialogFileList,
  type SnapshotDetailsDialogFileListProps,
}
