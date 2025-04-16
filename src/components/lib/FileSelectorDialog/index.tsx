import { useState } from 'react'

import type { FileType } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import { usePagesSync } from '@context/pages'
import { CommandMenu } from '@ui/CommandMenu'
import type { DialogProps } from '@ui/Dialog'
import type { PickPartial } from '@utils/types'

interface FileSelectorDialogProps<T extends FileType> extends DialogProps {
  types: T | T[]
  submitPath: (path: string | undefined) => void
}

const FileSelectorDialog = <T extends FileType>(
  props: FileSelectorDialogProps<T>,
) => {
  const { types, submitPath, ...dialogProps } = props

  const [search, setSearch] = useState('')
  const filesQuery = useQueryFiles(types, search)
  usePagesSync(types, search)

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
  dialogProps: PickPartial<
    Omit<FileSelectorDialogProps<FileType>, 'dialogKey'>,
    'types'
  >,
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
