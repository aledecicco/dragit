import { useMemo, useState } from 'react'

import type { FileType } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { hideDialog } from '@context/dialogs'
import { usePagesSync } from '@context/pages'
import type { AskProps } from '@lib/AskForValueDialog'
import type { Shortcut } from '@lib/ShortcutsCheatsheet'
import { CommandMenu } from '@ui/CommandMenu'

interface FileSelectorDialogProps<T extends FileType>
  extends AskProps<{ path: string }> {
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
  const { types, submitValue, ...askProps } = props

  const [search, setSearch] = useState('')
  const filesQuery = useQueryFiles(types, search)
  usePagesSync(types, search)

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
          hideDialog(askProps.dialogKey)
        }
      }}
      {...askProps}
      submitValue={(path) => submitValue(path ? { path } : undefined)}
    />
  )
}

export { FileSelectorDialog, type FileSelectorDialogProps }
