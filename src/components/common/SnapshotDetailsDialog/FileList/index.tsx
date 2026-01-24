import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'

import type { Page, VersionedFileInfo } from '@/api/models'
import { QueryList } from '@/lib/QueryList'
import { propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { SnapshotDetailsDialogItem } from '../Item'

interface SnapshotDialogFileListProps extends Ariakit.RadioGroupProps {
  /**
   * The query that fetches the files.
   */
  filesQuery: UseQueryResult<Page<VersionedFileInfo>>
}

/**
 * Displays a list of files that can be selected.
 */
const SnapshotDialogFileList = (props: SnapshotDialogFileListProps) => {
  const { filesQuery, ...radioProps } = props

  return (
    <Ariakit.RadioGroup
      render={
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
      }
      {...propsWithCn(radioProps, 'bg-dark-800 rounded-md')}
    />
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
