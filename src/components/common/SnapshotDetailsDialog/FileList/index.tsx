import { type ComponentProps, useState } from 'react'
import * as Ariakit from '@ariakit/react'

import type { SnapshotInfo, VersionedFileInfo } from '@/api/models'
import {
  SNAPSHOT_FILES_PAGE_SIZE,
  useQuerySnapshotFiles,
} from '@/api/queries/snapshotFiles'
import { useNeedsPagination } from '@/api/utils'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { SnapshotDetailsDialogItem } from './Item'

interface SnapshotDialogFileListProps extends ComponentProps<'div'> {
  /**
   * The snapshot for which to display the files.
   */
  snapshotInfo: SnapshotInfo

  /**
   * Callback to set the currently selected file, which will be shown in the diff viewer.
   */
  setSelectedFile: (file: VersionedFileInfo | undefined) => void
}

/**
 * Displays a list of files that can be selected.
 */
const SnapshotDialogFileList = (props: SnapshotDialogFileListProps) => {
  const { snapshotInfo, setSelectedFile, ...divProps } = props

  const [page, setPage] = useState(0)

  const filesQuery = useQuerySnapshotFiles(snapshotInfo, page)
  const showPagination = useNeedsPagination(filesQuery, page)

  const radio = Ariakit.useRadioStore({
    focusLoop: false,
    setValue: (value) => {
      setSelectedFile(
        filesQuery.data?.items.find((file) => file.path === value),
      )
    },
  })

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
          />
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
    </div>
  )
}

export { SnapshotDialogFileList, type SnapshotDialogFileListProps }
