import { useMemo, useState } from 'react'

import type { FileType } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { hideDialog } from '@context/dialogs'
import { useHandleFilesPageSync } from '@context/pages'
import type { AskForValueProps } from '@lib/AskForValueDialog'
import type { Shortcut } from '@lib/ShortcutsCheatsheet'
import { CommandMenu } from '@ui/CommandMenu'

interface FileSelectorDialogProps<T extends FileType>
  extends AskForValueProps<{ path: string }> {
  types: T | T[]
}

const EXTRA_SHORTCUTS: Shortcut[] = [
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' },
      { symbol: '↵', keyName: 'Enter' },
    ],
    combined: true,
    label: 'Use all matches',
  },
]

const FileSelectorDialog = <T extends FileType>(
  props: FileSelectorDialogProps<T>,
) => {
  const { types, submitValue, ...askForValueProps } = props

  const [search, setSearch] = useState('')
  const filesQuery = useQueryFiles(types, search)
  useHandleFilesPageSync(types, search)

  const items = useMemo(() => {
    return filesQuery.data?.items.map((file) => ({
      value: file.path,
    }))
  }, [filesQuery.data])

  return (
    <CommandMenu
      items={items}
      extraShortcuts={EXTRA_SHORTCUTS}
      onSearchChange={setSearch}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          submitValue({ path: search.length ? search : '.' })
          hideDialog(askForValueProps.dialogKey)
        }
      }}
      {...askForValueProps}
      submitValue={(path) => submitValue(path ? { path } : undefined)}
    />
  )
}

export { FileSelectorDialog, type FileSelectorDialogProps }
