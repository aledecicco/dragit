import { useState } from 'react'

import type { FileInfo, FileTypeFilter, Page } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import type { UseQueryResult } from '@tanstack/react-query'
import { CommandMenu } from '@ui/CommandMenu'
import type { DialogProps } from '@ui/Dialog'
import type { PickPartial } from '@utils/types'

interface FileSelectorDialogProps extends DialogProps {
  types: FileTypeFilter
  submitPath: (path: string | undefined) => void
}

const FileSelectorDialog = (props: FileSelectorDialogProps) => {
  const { types, submitPath, ...dialogProps } = props

  const [search, setSearch] = useState('')
  const filesQuery: UseQueryResult<Page<FileInfo>> = useQueryFiles(
    types,
    search,
  )

  return (
    <CommandMenu
      items={filesQuery.data?.items.map((file) => ({
        value: file.path,
      }))}
      shortcuts={[]}
      onSearchChange={setSearch}
      submitValue={submitPath}
      {...dialogProps}
    />
  )
}

const selectFiles = (
  dialogProps: PickPartial<Omit<FileSelectorDialogProps, 'dialogKey'>, 'types'>,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dialogKey = getUniqueId()

    showDialog(
      dialogKey,
      <FileSelectorDialog
        dialogKey={dialogKey}
        {...dialogProps}
        submitPath={(path) => {
          dialogProps.submitPath?.(path)
          if (path === undefined) {
            reject(new Error('Path not provided'))
          } else {
            resolve(path)
          }
        }}
      />,
    )
  })
}

export { FileSelectorDialog, type FileSelectorDialogProps, selectFiles }
