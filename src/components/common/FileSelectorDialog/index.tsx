import { useState } from 'react'

import type { WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/context/pages'
import { Pagination } from '@/lib/Pagination'
import type { Shortcut } from '@/lib/ShortcutsCheatsheet'
import { requestValueFromDialog } from '@/lib/ValueRequester/Dialog'
import { VirtualizedDiv } from '@/lib/VirtualizedDiv'
import { CommandMenu, type CommandMenuProps } from '@/ui/CommandMenu'
import { CommandMenuItem } from '@/ui/CommandMenu/Item'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

interface FileSelectorDialogProps<T extends WorktreeFileType>
  extends CommandMenuProps {
  /**
   * The types of files to match.
   */
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

/**
 * Dialog that allows the user to search for files matching a pathspec, and select one (or all) of them.
 */
const FileSelectorDialog = <T extends WorktreeFileType>(
  props: FileSelectorDialogProps<T>,
) => {
  const { types, ...commandMenuProps } = props

  const [search, setSearch] = useState('')
  const filesQuery = useQueryWorktreeFiles(types, search)
  useHandleFilesPageSync(types, search)

  const items = filesQuery.data?.items.map((file) => file.path)

  const page = useWorktreeFilesPage(types)
  const showPagination = useNeedsPagination(filesQuery, page)

  const shortcuts = showPagination
    ? [...SHORTCUTS, ...PAGINATION_SHORTCUTS]
    : SHORTCUTS

  return (
    <CommandMenu
      shortcuts={shortcuts}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          commandMenuProps.submitValue({
            value: search.length ? search : '.',
          })
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
      {...commandMenuProps}
      onSearchChange={(newSearch) => {
        commandMenuProps.onSearchChange?.(newSearch)
        setSearch(newSearch)
      }}
      footer={
        showPagination && (
          <Pagination
            page={page}
            pageSize={WORKTREE_FILES_PAGE_SIZE}
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
        renderItem={(value) => <CommandMenuItem value={value} />}
        options={mapFn(items, (items) => ({
          getItemKey: (index: number) => items[index],
          gap: 0,
          paddingStart: 4,
          paddingEnd: 12,
        }))}
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

const requestFilePath = <T extends WorktreeFileType[]>(types: T) =>
  requestValueFromDialog(FileSelectorDialog, { types }).then(
    ({ value }) => value,
  )

export { FileSelectorDialog, type FileSelectorDialogProps, requestFilePath }
