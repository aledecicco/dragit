import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'

import type { Page, SnapshotInfo, VersionedFileInfo } from '@/api/models'
import { QueryList } from '@/lib/QueryList'
import { propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { SnapshotDetailsDialogItem } from '../Item'

interface SnapshotDialogFileListProps extends Ariakit.RadioGroupProps {
  /**
   * The snapshot that contains the files.
   */
  snapshotInfo: SnapshotInfo

  /**
   * The query that fetches the files.
   */
  filesQuery: UseQueryResult<Page<VersionedFileInfo>>
}

/**
 * Displays a list of files that can be selected.
 */
const SnapshotDialogFileList = (props: SnapshotDialogFileListProps) => {
  const { snapshotInfo, filesQuery, ...radioProps } = props

  return (
    <Ariakit.RadioGroup
      {...propsWithCn(
        radioProps,
        'overflow-y-hidden',
        'bg-dark-700 border border-dark-300 rounded-lg',
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
        placeholdersCount={Math.min(
          10,
          snapshotInfo.changes?.filesCount
            ? snapshotInfo.changes.filesCount
            : 1,
        )}
      />
    </Ariakit.RadioGroup>
  )
}

const useFileSelector = (files: Page<VersionedFileInfo> | undefined) => {
  const store = Ariakit.useRadioStore({
    focusLoop: false,
  })
  const selectedFile = Ariakit.useStoreState(store, (state) =>
    files?.items.find((f) => f.path === state.value),
  )

  return { store, selectedFile }
}

export {
  SnapshotDialogFileList,
  useFileSelector,
  type SnapshotDialogFileListProps,
}
