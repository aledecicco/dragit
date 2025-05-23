import { useMemo, useState } from 'react'

import type { FileType } from '@api/models'
import { FILE_STATUSES_PAGE_SIZE, useQueryFiles } from '@api/queries'
import { hideDialog } from '@context/dialogs'
import {
  setNextPage,
  setPrevPage,
  useFilesPage,
  useHandleFilesPageSync,
  useNeedsPagination,
} from '@context/pages'
import type { AskForValueProps } from '@lib/AskForValueDialog'
import { Pagination } from '@lib/Pagination'
import type { Shortcut } from '@lib/ShortcutsCheatsheet'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { CommandMenu } from '@ui/CommandMenu'
import { CommandMenuItem } from '@ui/CommandMenu/Item'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'

interface FileSelectorDialogProps<T extends FileType>
  extends AskForValueProps<{ path: string }> {
  types: T | T[]
}

const SHORTCUTS: Shortcut[] = [
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' },
      { symbol: '↵', keyName: 'Enter' },
    ],
    combined: true,
    label: 'Use all matches',
  },
]

const PAGINATION_SHORTCUTS: Shortcut[] = [
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' },
      { symbol: 'Q', keyName: 'q' },
    ],
    combined: true,
    label: 'Previous page',
  },
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' },
      { symbol: 'E', keyName: 'e' },
    ],
    combined: true,
    label: 'Next page',
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
    return filesQuery.data?.items.map((file) => file.path)
  }, [filesQuery.data])

  const virtualizerOptions = useMemo(() => {
    return mapFn(items, (items) => ({
      getItemKey: (index: number) => items[index],
      gap: 0,
      paddingStart: 4,
      paddingEnd: 12,
    }))
  }, [items])

  const page = useFilesPage(types)
  const showPagination = useNeedsPagination(filesQuery, page)

  const shortcuts = useMemo(() => {
    if (showPagination) {
      return [...SHORTCUTS, ...PAGINATION_SHORTCUTS]
    }

    return SHORTCUTS
  }, [showPagination])

  return (
    <CommandMenu
      shortcuts={shortcuts}
      onSearchChange={setSearch}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          submitValue({ path: search.length ? search : '.' })
          hideDialog(askForValueProps.dialogKey)
        }

        if (e.ctrlKey && (e.key === 'q' || e.key === 'Q')) {
          setPrevPage(types)
        }

        if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
          if (filesQuery.data?.hasNext) {
            setNextPage(types)
          }
        }
      }}
      {...askForValueProps}
      submitValue={(path) => submitValue(path ? { path } : undefined)}
      footer={
        showPagination && (
          <Pagination
            page={page}
            pageSize={FILE_STATUSES_PAGE_SIZE}
            hasNext={!!filesQuery.data?.hasNext}
            setPrevPage={() => {
              setPrevPage(types)
            }}
            setNextPage={() => {
              setNextPage(types)
            }}
            buttonProps={{
              variant: 'plain',
            }}
          />
        )
      }
    >
      <VirtualizedDiv
        size="sm"
        items={items}
        itemSize={36}
        RenderItem={CommandMenuItem}
        options={virtualizerOptions}
        fallback={
          <div
            className={cn('p-2 text-center', 'text-sm italic text-light-950')}
          >
            {items === undefined ? 'Loading matches.' : 'No matches found.'}
          </div>
        }
      />
    </CommandMenu>
  )
}

export { FileSelectorDialog, type FileSelectorDialogProps }
